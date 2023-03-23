import {NextApiRequest, NextApiResponse} from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check for secret to confirm this is a valid request
  // if (req.query.secret !== process.env.MY_SECRET_TOKEN) {
  //     return res.status(401).json({ message: 'Invalid token' })
  // }
  console.log(req.query);
  const entityId = req.query.entityId;

  if (!entityId) {
    return res.status(400).send('Missing entityId');
  }

  try {
    // this should be the actual path not a rewritten path
    // e.g. for "/blog/[slug]" this should be "/blog/post-1"
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    await res.revalidate(`/page/${entityId}`);

    return res.json({ revalidated: true });
  } catch (err) {
    console.log(err);
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).send('Error revalidating');
  }
}
