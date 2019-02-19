import Express from 'express';
import knex from '../knex';

interface RequestBody {
  comment: string,
  parentId?: number,
}

/**
 * Expects req.body to be a JSON object with the following keys:
 * - comment
 * - parentId?
 */
export default async (req: Express.Request, res: Express.Response) => {
  const options: RequestBody = req.body;

  if (!options.comment || options.comment !== `${options.comment}`) {
    return res.status(400).send({
      message: 'Request body must have a string "comment".',
    });
  }

  if (options.parentId && !Number.isInteger(options.parentId)) {
    return res.status(400).send({
      message: 'If "parentId" is set, it must be an integer.',
    });
  }

  try {
    const knexResponse = await knex('comment')
      .insert({
        comment: options.comment,
        parent_id: options.parentId,
        ip_address: req.ip,
      })
      .returning('id');

    const id = +knexResponse[0];
    res.status(200).send({ id });
  } catch (err) {
    console.error(err);

    // FIXME: assume for now that a db error is the result of a non-existing parent comment
    res.status(500).send({
      message: `The given parent comment does not exist!`,
    })
  }
};
