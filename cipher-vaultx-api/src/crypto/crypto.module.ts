import { Module, Global } from '@nestjs/common';
import { CryptoService } from './crypto.service';

@Global()
@Module({
  exports: [CryptoService],
  providers: [CryptoService],
})
export class CryptoModule {}
