import { Injectable } from '@nestjs/common';
import { getManager } from 'typeorm';
import { BlobServiceClient } from '@azure/storage-blob';

const blobConnectionString = process.env.BLOB_STORAGE_CONNECTION_STRING;

import {
    AggregateActiveUserQuery,
    AggregateActiveUsers,
    MaxUserLoginCountInADay,
} from './identity-event.controller';

@Injectable()
export class IdentityEventService {
    getDailyActiveUsers = async (
        query: AggregateActiveUserQuery,
        total: boolean,
    ) => {
        const entityManager = getManager();
        const dbActiveUsersDaysQuery = entityManager
            .createQueryBuilder()
            .select('CAST(COUNT(DISTINCT user_id) AS INTEGER) AS activeCount');
        if (!total) {
            dbActiveUsersDaysQuery.addSelect(['time']).groupBy('time');
        }
        dbActiveUsersDaysQuery.from('active_users_daily', 't');

        if (query.startDate) {
            dbActiveUsersDaysQuery.andWhere('time >= :start_date', {
                start_date: query.startDate,
            });
        }

        if (query.endDate) {
            dbActiveUsersDaysQuery.andWhere('time <= :end_date', {
                end_date: query.endDate,
            });
        }

        if (query.order) {
            if (query.order.time) {
                dbActiveUsersDaysQuery.orderBy('time', query.order.time);
            }
        }

        return await dbActiveUsersDaysQuery.execute();
    };

    async queryUserActivity(
        query: AggregateActiveUserQuery,
    ): Promise<AggregateActiveUsers> {
        const dailyActiveUsers = await this.getDailyActiveUsers(query, false);

        const totalActiveUsers = await this.getDailyActiveUsers(query, true);
        return {
            days: dailyActiveUsers,
            total: totalActiveUsers[0].activecount,
        };
    }

    async queryMaxUserLoginCountInADay(): Promise<MaxUserLoginCountInADay> {
        const entityManager = getManager();
        const dbMaxUserLoginCountInADayQuery = entityManager
            .createQueryBuilder()
            .select('time, CAST(count AS INTEGER)')
            .from('cerulean.user_login_counts_daily', 'l_c1')
            .innerJoin(
                query => {
                    return query
                        .from('cerulean.user_login_counts_daily', 'l_c2')
                        .select('MAX(count) AS max_count');
                },
                'l_c2',
                'count= l_c2.max_count',
            );
        const maxLoginCountInADay = await dbMaxUserLoginCountInADayQuery.execute();
        return maxLoginCountInADay[0];
    }

    async insertNewIdentityEvent(auth0EventData) {
        const EVENT_SOURCE = 'auth0';
        const entityManager = getManager();

        const identityEvent = {
            time: auth0EventData.date,
            source: EVENT_SOURCE,
            type: auth0EventData.type,
            connection: auth0EventData.connection,
            connection_id: auth0EventData.connection_id,
            client_id: auth0EventData.client_id,
            client_name: auth0EventData.client_name,
            ip: auth0EventData.ip,
            user_agent: auth0EventData.user_agent,
            hostname: auth0EventData.hostname,
            user_id: auth0EventData.user_id,
            user_name: auth0EventData.user_name,
            log_id: auth0EventData.log_id,
            strategy: auth0EventData.strategy,
            strategy_type: auth0EventData.strategy_type,
            description: auth0EventData.description,
        };

        await entityManager
            .createQueryBuilder()
            .insert()
            .into('identity_event')
            .values(identityEvent)
            .execute();

        console.log('Inserted identity event to the database');
    }

    async parseIdentityEventFromBlob(blobMeta) {
        console.log("Trying to get identity event from blob...", blobMeta);
        const blobServiceClient = BlobServiceClient.fromConnectionString(
            blobConnectionString,
        );
        const containerClient = blobServiceClient.getContainerClient('auth0');
        const fixedName = blobMeta.subject.replace(
            '/blobServices/default/containers/auth0/blobs/',
            '',
        );
        const blockBlobClient = containerClient.getBlockBlobClient(fixedName);
        const downloadBlockBlobResponse = await blockBlobClient.download(0);
        const auth0EventData = JSON.parse(
            await this.streamToString(
                downloadBlockBlobResponse.readableStreamBody,
            ),
        );
        this.insertNewIdentityEvent(auth0EventData);
    }

    async streamToString(readableStream): Promise<string> {
        return new Promise((resolve, reject) => {
            const chunks = [];
            readableStream.on('data', data => {
                chunks.push(data.toString());
            });
            readableStream.on('end', () => {
                resolve(chunks.join(''));
            });
            readableStream.on('error', reject);
        });
    }
}
