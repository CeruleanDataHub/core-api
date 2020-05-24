import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HierarchyService } from './hierarchy.service';
import { HierarchyController } from './hierarchy.controller';
import { Hierarchy } from './hierarchy.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Hierarchy])],
    providers: [HierarchyService],
    controllers: [HierarchyController],
    exports: [HierarchyService],
})
export class HierarchyModule {}
