import {
  Get,
  Post,
  Controller,
  UseGuards,
  Param,
  Body,
} from '@nestjs/common';

import { ShopService } from './shop.service';
import { getConnection } from 'typeorm';
import { shop_items } from './shop_items.entity';
import { AuthGuard } from 'src/shared/auth.guard';
import { Account } from 'src/auth/account.decorator';

@Controller('shop')
export class ShopController {
  constructor(private shopService: ShopService) {}

  @Get("/")
  async getShop() {
    const connection = getConnection('shopConnection');
    return await connection
    .getRepository(shop_items)
    .createQueryBuilder('shop_items')
    .select([
        'shop_items.id as id',
        'shop_items.title as title',
        'shop_items.price as price',
        'shop_items.wowhead_link as wowhead_link',
        'shop_items.data_wowhead as data_wowhead',
        'shop_items.icon_link as icon_link',
        'shop_items.active as active'
    ])
    .getRawMany();
  }

@Post('/buy/:id')
@UseGuards(new AuthGuard())
async buyItem(
  @Param('id') itemId: number,
  @Account('id') accountId: number,
  @Body('characterId') characterId: number
) {
  const connection = getConnection('shopConnection');

  try {

    const characterResult = await connection.query(
      `SELECT account FROM acore_characters.characters WHERE guid = ?`,
      [characterId]
    );
    console.log("Character "+ characterId+ " with account "+ characterResult[0]?.account  + " is trying to buy item "+ itemId);
    
    if (!characterResult || characterResult[0]?.account !== accountId) {
      return {statusCode:"401", message: ["Failed to purchase item"], error: "Character does not belong to this account"};
    }

    // Fetch user vote points and donate points
    const userVotePointsResult = await connection.query(
      `SELECT points FROM acore_auth.account_information WHERE ID = ?`,
      [accountId]
    );
    const userDonatePointsResult = await connection.query(
      `SELECT coins FROM acore_auth.account_information WHERE ID = ?`,
      [accountId]
    );

    // Fetch item details
    const itemDetails = await connection
      .getRepository(shop_items)
      .createQueryBuilder('shop_items')
      .select(['shop_items.isVoteItem', 'shop_items.price', 'shop_items.item_id'])
      .where('shop_items.id = :id', { id: itemId })
      .getOne();

    const userVotePoints: number = userVotePointsResult[0]?.points || 0;
    const userDonatePoints: number = userDonatePointsResult[0]?.coins || 0;
    const voteItemFlag: number = itemDetails?.isVoteItem || 0;
    const itemPrice: number = itemDetails?.price || 0;
    const wowItemId: number = itemDetails?.item_id;

    if (!itemDetails || !wowItemId) {
      return {statusCode:"401",message: ["Failed to purchase item"], error: "Item not found in shop"}
    }

    let availableCurrency: number;
    let currencyType: string;
    switch (voteItemFlag) {
      case 1:
        availableCurrency = userVotePoints;
        currencyType = 'points';
        break;
      default:
        availableCurrency = userDonatePoints;
        currencyType = 'coins';
        break;
    }

    if (availableCurrency < itemPrice) {
      return {statusCode:"401",message: ["Failed to purchase item"], error: "Insufficient Currency to buy this item"}
    }

    await connection.transaction(async (transactionalEntityManager) => {
      // Deduct points or coins
      await transactionalEntityManager.query(
        `UPDATE acore_auth.account_information 
         SET ${currencyType} = ${currencyType} - ? 
         WHERE ID = ?`,
        [itemPrice, accountId]
      );

      // Generate a unique item guid
      const guidResult = await transactionalEntityManager.query(`
        SELECT MAX(guid) AS max_guid FROM acore_characters.item_instance
        UNION
        SELECT MAX(item_guid) FROM acore_characters.mail_items
        UNION
        SELECT MAX(item) FROM acore_characters.character_inventory
        UNION
        SELECT MAX(itemguid) FROM acore_characters.auctionhouse
      `);
      const maxGuid = Math.max(...guidResult.map((row: any) => row.max_guid || 0));
      const newGuid = maxGuid + 1;

      // Get durability
      const durabilityResult = await transactionalEntityManager.query(
        `SELECT MaxDurability FROM acore_world.item_template WHERE entry = ?`,
        [wowItemId]
      );
      const durability = durabilityResult[0]?.MaxDurability || 0;

      // Insert item instance
      await transactionalEntityManager.query(
        `INSERT INTO acore_characters.item_instance (
          guid, itemEntry, owner_guid, creatorGuid, giftCreatorGuid, 
          count, duration, charges, flags, enchantments, 
          randomPropertyId, durability, playedTime, text
        ) VALUES (?, ?, ?, 0, 0, 1, 0, '0 0 0 0 0', 0, '0 0 0 0 0 0 0 0 0 0 0 0', 0, ?, 0, '')`,
        [newGuid, wowItemId, characterId, durability]
      );

      // 🔧 Get max mail ID and increment it manually
      const mailIdResult = await transactionalEntityManager.query(
        `SELECT COALESCE(MAX(id), 0) AS max_id FROM acore_characters.mail`
      );
      const newMailId = (mailIdResult[0]?.max_id || 0) + 1;

      // Insert mail
      await transactionalEntityManager.query(
        `INSERT INTO acore_characters.mail (
          id, messageType, stationery, mailTemplateId, sender, receiver, 
          subject, body, has_items, expire_time, deliver_time, money, cod, checked
        ) VALUES (
          ?, 0, 61, 0, 0, ?, 'Compra en la tienda AzGate', 'Gracias por tu compra!', 
          1, UNIX_TIMESTAMP() + 30*24*3600, UNIX_TIMESTAMP(), 0, 0, 0
        )`,
        [newMailId, characterId]
      );

      // Insert mail_items with manually-set mail ID
      await transactionalEntityManager.query(
        `INSERT INTO acore_characters.mail_items (
          mail_id, item_guid, receiver
        ) VALUES (?, ?, ?)`,
        [newMailId, newGuid, characterId]
      );
    });

    return { message: 'Item purchased and sent to character via mail' };
  } catch (error) {
    throw new Error(error.message)
  }
}


}
