import { IsString } from "class-validator";

export class SearchSmallSubTitle {
    @IsString()
    title : string;
}