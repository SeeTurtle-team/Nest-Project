class Queue{
    storage: {};
    front: number;
    rear: number;

    constructor(){
        this.storage = {};
        this.front = 0;
        this.rear = 0;
    }

    /**큐 크기 구하기 */
    size(){
        if(this.storage[this.rear] === undefined){
            return 0;  //rear가 가르키는 값이 없을 때(아무 데이터가 없는 경우)
        }else{
            return this.rear - this.front + 1; //크기 반환
        }
    }

    //큐에 값 추가
    add(value){
        if(this.size() === 0){
            this.storage['0'] = value; //값이 아무 것도 없을 때
        } else{
            this.rear += 1;
            this.storage[this.rear] = value; // rear의 위치를 1만큼 늘리고 해당 위치에 값 삽입
        }
    }

    //큐에서 데이터 추출
    popleft(){
        let temp;

        if(this.front === this.rear){
            temp = this.storage[this.front];
            delete this.storage[this.front];

            this.front = 0;
            this.rear = 0;
        }else {
            temp = this.storage[this.front];
            delete this.storage[this.front];
            this.front++;
        }

        return temp;
    }
}