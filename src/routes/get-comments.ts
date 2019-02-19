import Express from 'express';
import knex from '../knex';

interface KnexResponseRow {
  id: string,
  parent_id?: string,
}

export default async (req: Express.Request, res: Express.Response) => {
  const comments = await knex('comment')
    .select('id', 'parent_id', 'comment', 'created_at');

  res.status(200).json({
    comments: comments.map(({ id, parent_id, ...rest }: KnexResponseRow) => ({
      id: +id,
      parentId: +parent_id,
      ...rest,
    })),
  });
};
