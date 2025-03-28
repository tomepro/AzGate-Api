import {
  Controller,
  Get,
} from '@nestjs/common';

import { WorldService } from './world.service';
import { getConnection } from 'typeorm';
import { Changelog } from './changelog.entity';

@Controller('world')
export class WorldController {
  constructor(private worldService: WorldService) {}
    @Get('/changelog')
    async getChangelog() {
      const connection = getConnection('worldConnection');
        return await connection
          .getRepository(Changelog)
          .createQueryBuilder('changelog')
          .select([
            'changelog.id as id',
            'changelog.created_at as created_at',
            'changelog.text as text'
          ])
          .orderBy('changelog.id', 'DESC')
          .limit(1)
          .getRawOne();
    }
}
