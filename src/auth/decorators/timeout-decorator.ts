import { SetMetadata } from "@nestjs/common";

export const TIMEOUT_METADATA_KEY = "timeout";

export const TimeoutHandler = (ms: number) => SetMetadata(TIMEOUT_METADATA_KEY, ms);
