import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { Connection, Repository } from 'typeorm';
import { BoardEntity } from 'src/entities/board.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoardRepository } from './repository/board.repository';
import { BoardNotifyEntity } from 'src/entities/boardNotify.entity';
import { BoardCategoryEntity } from 'src/entities/boardCategory.entity';
import { BoardRecommendEntity } from 'src/entities/boardRecommend.entity';
import { BoardModule } from './board.module';

const MockBoardRepository = () => ({
  find: jest.fn(),
  getAll : jest.fn()
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('BoardService', () => {
  let service: BoardService;
  let boardRepository: MockRepository<BoardEntity>
  let boardNofityRepository : MockRepository<BoardNotifyEntity>
  //let boardRepository : Repository<BoardEntity>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // providers: [
      //   BoardService,{
      //     provide:getRepositoryToken(BoardRepository),
      //     useValue : MockBoardRepository(),
      //   }
      // ],
      imports: [BoardModule],
      providers: [
        BoardService,
        {
          provide: getRepositoryToken(BoardEntity),
          useValue: MockBoardRepository,
          useClass: Repository,
        },
        {
          provide : getRepositoryToken(BoardNotifyEntity),
          useClass: Repository,
        },
        {
          provide : getRepositoryToken(BoardCategoryEntity),
          useClass: Repository
        },
        {
          provide : getRepositoryToken(BoardRecommendEntity),
          useClass:Repository
        },
       
      ]
    }).compile();

    service = module.get<BoardService>(BoardService);
    boardRepository = module.get<MockRepository<BoardEntity>>(
      getRepositoryToken(BoardEntity)
    );
    boardNofityRepository = module.get<MockRepository<BoardNotifyEntity>>(
      getRepositoryToken(BoardNotifyEntity)
    )
  });


  // afterEach(async () => {
  //   // 테스트용 데이터 삭제
  //   await boardRepository.clear();
  // });


  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });

  describe('getAll', () => {
    describe('when get Board page', () => {
      beforeEach(async () => {
        boardRepository.find.mockResolvedValue({
          "pageSize": 10,
          "totalCount": "257289",
          "totalPage": 25729,
          "items": [
            {
              "id": 257345,
              "title": "ㅁㄴㅇㅁㄴㅇ",
              "dateTime": "2023-11-14T13:20:09.074Z",
              "category": "IT/개발",
              "recommendCount": null,
              "nickname": "관리자"
            },
          ]
        });
        await service.getAll(2);
      }
      )

      it('get All', async () => {
        jest.spyOn(boardRepository, 'find')
          .mockResolvedValue({
            "pageSize": 10,
            "totalCount": "257289",
            "totalPage": 25729,
            "items": [
              {
                "id": 257345,
                "title": "ㅁㄴㅇㅁㄴㅇ",
                "dateTime": "2023-11-14T13:20:09.074Z",
                "category": "IT/개발",
                "recommendCount": null,
                "nickname": "관리자"
              },
              {
                "id": 257344,
                "title": "?>??",
                "dateTime": "2023-08-23T08:25:54.345Z",
                "category": "법률",
                "recommendCount": null,
                "nickname": "집가고싶다"
              },
              {
                "id": 257343,
                "title": "testsetasdtasdtasdtasdt",
                "dateTime": "2023-08-08T06:50:29.175Z",
                "category": "법률",
                "recommendCount": null,
                "nickname": "55"
              },
              {
                "id": 257342,
                "title": "업무 시간에 뻘글 작성은 정말 재미있다네",
                "dateTime": "2023-08-07T04:13:39.620Z",
                "category": "취미",
                "recommendCount": null,
              },
              {
                "id": 257341,
                "title": "미미미밈",
                "dateTime": "2023-08-07T04:12:48.388Z",
                "category": "스포츠",
                "recommendCount": null,
                "nickname": "집가고싶다"
              },
              {
                "id": 257340,
                "title": "퍼킹!",
                "dateTime": "2023-08-07T04:11:54.493Z",
                "category": "IT/개발",
                "recommendCount": null,
                "nickname": "집가고싶다"
              },
              {
                "id": 257339,
                "title": "sdfsdafsdf",
                "dateTime": "2023-08-07T03:57:00.359Z",
                "category": "법률",
                "recommendCount": "2",
                "nickname": "조병규"
              },
              {
                "id": 257338,
                "title": "뭐지",
                "dateTime": "2023-08-07T03:12:33.968Z",
                "category": "전체\n",
                "recommendCount": "1",
                "nickname": "test nickname\n"
              },
              {
                "id": 257337,
                "title": "sdfasdfsadfasf",
                "dateTime": "2023-08-07T03:07:22.799Z",
                "category": "스포츠",
                "recommendCount": null,
                "nickname": "test nickname\n"
              },
              {
                "id": 257336,
                "title": "sdafsdasdafsdafsdaf",
                "dateTime": "2023-08-07T03:05:57.619Z",
                "category": "IT/개발",
                "recommendCount": null,
                "nickname": "test nickname\n"
              }
            ]
          });

          const result = await service.getAll(1);

          expect(result).toEqual({
            "pageSize": 10,
            "totalCount": "257289",
            "totalPage": 25729,
            "items": [
              {
                "id": 257345,
                "title": "ㅁㄴㅇㅁㄴㅇ",
                "dateTime": "2023-11-14T13:20:09.074Z",
                "category": "IT/개발",
                "recommendCount": null,
                "nickname": "관리자"
              },
              {
                "id": 257344,
                "title": "?>??",
                "dateTime": "2023-08-23T08:25:54.345Z",
                "category": "법률",
                "recommendCount": null,
                "nickname": "집가고싶다"
              },
              {
                "id": 257343,
                "title": "testsetasdtasdtasdtasdt",
                "dateTime": "2023-08-08T06:50:29.175Z",
                "category": "법률",
                "recommendCount": null,
                "nickname": "55"
              },
              {
                "id": 257342,
                "title": "업무 시간에 뻘글 작성은 정말 재미있다네",
                "dateTime": "2023-08-07T04:13:39.620Z",
                "category": "취미",
                "recommendCount": null,
              },
              {
                "id": 257341,
                "title": "미미미밈",
                "dateTime": "2023-08-07T04:12:48.388Z",
                "category": "스포츠",
                "recommendCount": null,
                "nickname": "집가고싶다"
              },
              {
                "id": 257340,
                "title": "퍼킹!",
                "dateTime": "2023-08-07T04:11:54.493Z",
                "category": "IT/개발",
                "recommendCount": null,
                "nickname": "집가고싶다"
              },
              {
                "id": 257339,
                "title": "sdfsdafsdf",
                "dateTime": "2023-08-07T03:57:00.359Z",
                "category": "법률",
                "recommendCount": "2",
                "nickname": "조병규"
              },
              {
                "id": 257338,
                "title": "뭐지",
                "dateTime": "2023-08-07T03:12:33.968Z",
                "category": "전체\n",
                "recommendCount": "1",
                "nickname": "test nickname\n"
              },
              {
                "id": 257337,
                "title": "sdfasdfsadfasf",
                "dateTime": "2023-08-07T03:07:22.799Z",
                "category": "스포츠",
                "recommendCount": null,
                "nickname": "test nickname\n"
              },
              {
                "id": 257336,
                "title": "sdafsdasdafsdafsdaf",
                "dateTime": "2023-08-07T03:05:57.619Z",
                "category": "IT/개발",
                "recommendCount": null,
                "nickname": "test nickname\n"
              }
            ]
          })
      })
    })
  })
  // describe('getAll',() => {
  //   it('should return array type',async ()=>{
  //     // jest.spyOn(service,'getAll').mockReturnValue
  //     const items = await service.getAll(2);
  //     console.log(items)
  //     expect(items).toBeDefined();
  //     expect(Array.isArray(items)).toBeTruthy();
  //   })
  // })

});
