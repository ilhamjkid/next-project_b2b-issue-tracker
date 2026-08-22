export type BaseOutputOptions<TEntity> =
  | "ALL_FIELDS"
  | ({ id: true } & Partial<Record<Exclude<keyof TEntity, "id">, boolean>>);

export type BaseOutputFields<
  TEntity,
  TOutputOptions extends BaseOutputOptions<TEntity>,
> = TOutputOptions extends "ALL_FIELDS"
  ? TEntity
  : {
      [Key in keyof TEntity as Key extends keyof TOutputOptions
        ? TOutputOptions[Key] extends true
          ? Key
          : never
        : never]: TEntity[Key];
    };

export type BaseQueryResult<TOutputData> = Promise<
  | {
      success: true;
      data: TOutputData;
    }
  | {
      success: false;
      message?: string;
    }
>;
