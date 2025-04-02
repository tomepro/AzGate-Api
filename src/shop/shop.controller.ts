import {
  Get,
  Controller,
} from '@nestjs/common';

import { ShopService } from './shop.service';
import { getConnection } from 'typeorm';
import { Shop_Items } from './shop_items.entity';

@Controller('shop')
export class ShopController {
  constructor(private shopService: ShopService) {}

  @Get("/shop")
  async getShop() {
    const connection = getConnection('shopConnection');
    return await connection
    .getRepository(Shop_Items)
    .createQueryBuilder('shop_items')
    .select([
        'shop_items.title as title',
        'shop_items.price as price',
        'shop_items.wowhead_link as wowhead_link',
        'shop_items.data_wowhead as data_wowhead',
        'shop_items.icon_link as icon_link',
        'shop_items.active as active'
    ])
    .getRawMany();
  }
}
