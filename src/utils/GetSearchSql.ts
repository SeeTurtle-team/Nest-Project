import { Injectable } from '@nestjs/common';

@Injectable()
export class GetSearchSql {
  getWhiteSpaceOrSql(table, columns, keyword) {
    const arr = keyword.split(' ');
    let whiteSpace = [];
    if (typeof columns === 'string') {
      //단일 컬럼에 대한 조회
      whiteSpace = arr.map((e, i) => {
        if (i === 0) return `and ${table}.${columns} like '%${e}%'`;
        else return `or ${table}.${columns} like '%${e}%'`;
      });
    } else {
      whiteSpace = arr.map((e, i) => {
        //복수 컬럼에 대한 조회
        if (i == 0)
          return `and ${table}.${Object.keys(columns)[0]} like '%${e}%'
            or ${table}.${Object.keys(columns)[1]} like '%${e}%'`;
        else
          return `or ${table}.${Object.keys(columns)[0]} like '%${e}%'
            or ${table}.${Object.keys(columns)[1]} like '%${e}%'`;
      });
    }

    return whiteSpace.join(' ');
  }
}
