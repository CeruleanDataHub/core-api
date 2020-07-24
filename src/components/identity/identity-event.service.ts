import { Injectable } from '@nestjs/common';
import { getManager } from 'typeorm';

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
            .select('time, count')
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
}
