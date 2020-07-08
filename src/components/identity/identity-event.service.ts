import { Injectable } from '@nestjs/common';
import { getManager } from 'typeorm';

import {
    AggregateActiveUserQuery,
    AggregateActiveUserRow,
} from './identity-event.controller';

@Injectable()
export class IdentityEventService {
    async queryAggregate(
        query: AggregateActiveUserQuery,
    ): Promise<AggregateActiveUserRow[]> {
        const entityManager = getManager();

        const aggregateViews = {
            //HOURLY: 'active_users_hourly',
            DAILY: 'active_users_daily',
            //WEEKLY: 'active_users_weekly',
        };

        const aggregateView = aggregateViews[query.type];

        const dbQuery = entityManager
            .createQueryBuilder()
            .select(['time', 'active_users AS "activeUsers"'])
            .from(aggregateView, 't');

        if (query.startDate) {
            dbQuery.andWhere('time >= :start_date', {
                start_date: query.startDate,
            });
        }

        if (query.endDate) {
            dbQuery.andWhere('time <= :end_date', { end_date: query.endDate });
        }

        if (query.order) {
            if (query.order.time) {
                dbQuery.orderBy('time', query.order.time);
            }
        }

        if (query.limit) {
            dbQuery.limit(query.limit);
        }

        return await dbQuery.getRawMany();
    }
}
