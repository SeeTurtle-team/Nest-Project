import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { InsertSmallTalkDto } from 'src/small-talk/dto/insertSmallTalk.dto';
import { SmallTalkService } from 'src/small-talk/small-talk.service';

interface MessagePayload {
  roomId: string;
  message: string;
  headers: any;
}

let createdRooms: string[] = [];


@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: ['http://localhost:3000'],
  },
})


export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  private logger = new Logger('Gateway');
  
  constructor(
    private readonly smallTalkService :  SmallTalkService,
  ){}

  @WebSocketServer() nsp: Namespace;


  afterInit() {
    this.nsp.adapter.on('delete-room', (room) => {
      const deletedRoom = createdRooms.find(
        (createdRoom) => createdRoom === room,
      );
      if (!deletedRoom) return;


      this.nsp.emit('delete-room', deletedRoom);
      createdRooms = createdRooms.filter(
        (createdRoom) => createdRoom !== deletedRoom,
      ); // 유저가 생성한 room 목록 중에 삭제되는 room 있으면 제거
    });


    this.logger.log('웹소켓 서버 초기화 ✅');
  }


  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 소켓 연결`);


    // socket.broadcast.emit('message', {
    //   contents: `${socket.id}가 들어왔습니다.`,
    // }); 
  }


  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 소켓 연결 해제 ❌`);
  }


  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody(){ roomId, message ,headers}: MessagePayload,
  ) {
    console.log('roomId '+roomId);
    console.log('msg '+message);
    console.log(headers);

    const insertSmallTalkDto = new InsertSmallTalkDto();

    insertSmallTalkDto.contents = message;
    insertSmallTalkDto.smallSubjectId = Number(roomId);

    const res = await this.smallTalkService.insertSmallTalk(insertSmallTalkDto,headers);

    if(res.success){
      socket.broadcast.to(roomId).emit('message', { 
        userId: res.verified.userId,
        contents: message,
        userName:res.verified.nickname });
      
      return { 
        userId: res.verified.userId,
        contents: message,
        userName:res.verified.nickname
      };


    } else{
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '스몰 톡 삽입 중 에러 발생',
          success: false,
        },
        500,
    );
    }
    
  }

  @SubscribeMessage('room-list')
  handleRoomList() {
    return createdRooms;
  }


  @SubscribeMessage('create-room')
  handleCreateRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const exists = createdRooms.find((createdRoom) => createdRoom === roomName);
    if (exists) {
      return { success: false, payload: `${roomName} 방이 이미 존재합니다.` };
    }


    socket.join(roomName); // 기존에 없던 room으로 join하면 room이 생성됨
    createdRooms.push(roomName); // 유저가 생성한 room 목록에 추가
    this.nsp.emit('create-room', roomName); // 대기실 방 생성


    return { success: true, payload: roomName };
  }


  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomId: string,
  ) {
    console.log(roomId)
    socket.join(roomId); // join room
    socket.broadcast
      .to(roomId)
      .emit('message', { contents: `${socket.id}가 들어왔습니다.` });


    return { success: true };
  }


  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    socket.leave(roomName); // leave room
    socket.broadcast
      .to(roomName)
      .emit('message', { contenst: `${socket.id}가 나갔습니다.` });


    return { success: true };
  }
}
