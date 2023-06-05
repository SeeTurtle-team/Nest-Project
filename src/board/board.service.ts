import { Injectable } from '@nestjs/common';

@Injectable()
export class BoardService {
  private boards = [];

  getBoard() {
    return this.boards;
  }
}
