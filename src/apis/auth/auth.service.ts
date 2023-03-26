import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import coolsms from 'coolsms-node-sdk';
import axios from 'axios';
import { Auth } from './entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificationCodeDto } from './dto/certification-code.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  async sendsms(phone: string) {
    // apiKey, apiSecret 설정
    const messageService = new coolsms(
      process.env.COOLSMS_API_KEY,
      process.env.COOLSMS_API_SECRET,
    );

    const randomNum = String(Math.random() * 100000000).substr(1, 6);
    await this.authRepository.save({ phone: phone, code: randomNum });
    // 2건 이상의 메시지를 발송할 때는 sendMany, 단일 건 메시지 발송은 sendOne을 이용해야 합니다.
    // messageService
    //   .sendOne({
    //     to: '01086472391',
    //     from: '01086472391',
    //     text: '한글 45자, 영자 90자 이상 입력되면 자동으로 LMS타입의 문자메시지가 발송됩니다.',
    //     type: 'SMS',
    //     autoTypeDetect: false,
    //   })
    //   .then((res) => {
    //     return res;
    //   })
    //   .catch((err) => console.error(err));

    return { status: { code: 200, msg: `${randomNum} 문자발송 완료!` } };
  }

  async certification(certificationCodeDto: CertificationCodeDto) {
    const { phone, code } = certificationCodeDto;
    // 존재 여부
    const validCode = await this.authRepository.findOneBy({ phone, code });
    const now = new Date();

    if (!validCode) {
      throw new ConflictException('유효한 인증코드가 존재하지 않습니다');
    } else {
      const limitTime = validCode.created_at;
      limitTime.setMinutes(limitTime.getMinutes() + 3);
      if (now > limitTime) {
        throw new ConflictException('인증코드의 유효기간이 지났습니다');
      } else {
        return {
          stauts: {
            code: 200,
            msg: 'success',
          },
        };
      }
    }
  }

  sendemail() {
    return `This action returns all auth`;
  }

  reset() {
    return `This action returns all auth`;
  }
}
