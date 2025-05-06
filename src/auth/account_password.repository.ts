import { createHash, randomBytes } from 'crypto';
import { EntityRepository, getRepository, MoreThan, Repository } from 'typeorm';

import { AccountPassword } from './account_password.entity';
import { AccountDto } from './dto/account.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Account } from './account.entity';
import { Email } from '../shared/email';
import { AccountPasswordDto } from './dto/account_password.dto';
import { Request } from 'express';
import { Misc } from '../shared/misc';

@EntityRepository(AccountPassword)
export class AccountPasswordRepository extends Repository<AccountPassword> {
  private accountRepo = getRepository(Account, 'authConnection');

  async forgotPassword(accountDto: AccountDto, request: Request) {
    const account = await this.accountRepo.findOne({
      reg_mail: accountDto.email,
    });

    if (!account) {
      throw new NotFoundException(['There is no account with email address']);
    }

    const resetToken: string = Math.floor(100000 + Math.random() * 900000).toString();
    const passwordResetExpires: any = new Date(
      Date.now() + 10 * 60 * 1000,
    ).toISOString();
    const passwordResetToken: string = createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const accountPassword = this.create();
    accountPassword.id = account.id;
    accountPassword.password_reset_expires = passwordResetExpires;
    accountPassword.password_reset_token = passwordResetToken;
    await this.save(accountPassword);

    try {
      const resetURL = `${resetToken}`;
      await new Email(account, resetURL).sendPasswordReset();
      return { status: 'success', message: ['Token sent to email'] };
    } catch (error) {
      await this.delete(account.id);

      if (error)
        throw new InternalServerErrorException([
          'There was an error sending the email. Try again later!',
        ]);
    }
  }

  async resetPassword(accountPasswordDto: AccountPasswordDto, token: string) {
    const { password, passwordConfirm } = accountPasswordDto;
    const hashedToken: string = createHash('sha256')
      .update(token)
      .digest('hex');

    const accountPassword = await this.findOne({
      where: {
        password_reset_token: hashedToken,
        password_reset_expires: MoreThan(new Date()),
      },
    });

    if (!accountPassword) {
      throw new BadRequestException(['Token is invalid or has expired']);
    }

    if (passwordConfirm !== password) {
      throw new BadRequestException(['Password does not match']);
    }

    const account = await this.accountRepo.findOne({
      where: { id: accountPassword.id },
    });

    account.verifier = Misc.calculateSRP6Verifier(
      account.username,
      password,
      account.salt,
    );
    await this.accountRepo.save(account);

    accountPassword.password_changed_at = new Date(Date.now() - 1000);
    accountPassword.password_reset_expires = null;
    accountPassword.password_reset_token = null;
    await this.save(accountPassword);

    return {
      status: 'success',
      message: ['Your password has been reset successfully!'],
    };
  }
}
