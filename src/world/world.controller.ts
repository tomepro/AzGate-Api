import {
  Controller,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';

import { WorldService } from './world.service';
import { getConnection } from 'typeorm';
import { Changelog } from './changelog.entity';
import { Server_news } from './news.entity';

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

  @Get("/news")
  async getNews() {
    const connection = getConnection('worldConnection');
      return await connection
        .getRepository(Server_news)
        .createQueryBuilder('server_news')
        .select([
          'server_news.id as id',
          'server_news.created_at as created_at',
          'server_news.title as title',
          'server_news.type as type',
          'server_news.image as image',
          'server_news.author as author',
          'server_news.text as text'
        ])
        .getRawMany();
  }


  @Get('/news/:id')
  async getNewsById(@Param('id') id: string) {
    const connection = getConnection('worldConnection');
    const news = await connection
      .getRepository(Server_news)
      .createQueryBuilder('server_news')
      .select([
        'server_news.id as id',
        'server_news.created_at as created_at',
        'server_news.title as title',
        'server_news.type as type',
        'server_news.image as image',
        'server_news.author as author',
        'server_news.text as text',
      ])
      .where('server_news.id = :id', { id })
      .getRawOne();

    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }

    return news;
  }
}
