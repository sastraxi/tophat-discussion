import Express from 'express';
import knex from '../knex';

interface KnexResponseRow {
  id: string,
  parent_id?: string,
  comment: string,
  created_at: string,
}

interface BaseComment {
  id: number,
  createdAt: string,
  comment: string,
}

interface CommentWithParentId extends BaseComment {
  parentId?: number,
};

interface CommentWithChildren extends BaseComment {
  children: CommentWithChildren[],
}

const parentIdToChildren = (
  { parentId, ...comment }: CommentWithParentId,
  allComments: CommentWithParentId[],
): CommentWithChildren => {
  const children = allComments
    .filter(x => x.parentId === comment.id)
    .map(child => parentIdToChildren(child, allComments));
  return {
    ...comment,
    children: children.length > 0 ? children : undefined,
  };
};

export default async (req: Express.Request, res: Express.Response) => {
  const comments: CommentWithParentId[] = await knex('comment')
    .select('id', 'parent_id', 'comment', 'created_at')
    .orderBy('created_at')
    .then(comments =>
      comments.map(({ id, parent_id, comment, created_at }: KnexResponseRow) => ({
        id: +id,
        parentId: +parent_id,
        comment,
        createdAt: created_at,
      }))
    );

  const topLevel = comments
    .filter(x => !x.parentId)
    .map(child => parentIdToChildren(child, comments));

  res.status(200).json({
    comments: topLevel,
  });
};
