import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
  login() {
    return 'User logged in';
  }

  register() {
    return 'User registered';
  }
}
