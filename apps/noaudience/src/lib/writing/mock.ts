export interface Writing {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  folder: string | null;
  wordCount: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
}

export interface Folder {
  id: string;
  name: string;
  writingCount: number;
}

export const mockWritings: Writing[] = [
  {
    id: '1',
    title: 'On the Pleasure of No Audience',
    content: `There is a particular freedom in writing for no one. When the expectation of readership dissolves, what remains is the purest form of thought — unperformed, unpolished, unafraid.

I started this practice six months ago. Each morning, before the world wakes up, I sit with a blank page and write whatever comes. No structure. No thesis. Just the raw movement of mind across language.

The results have surprised me. Without an audience to perform for, my sentences grew shorter. My thoughts grew bolder. I stopped hedging every claim with qualifiers and started saying what I actually believed.

This is not journaling, exactly. Journaling implies a record, a diary of events. This is something closer to thinking aloud — except the thinking happens through the fingers, through the act of pressing keys, through the slow accumulation of words that no one will ever read.

And yet, paradoxically, it has made my public writing better. The muscle of honesty, once exercised in private, carries over into everything else.`,
    excerpt: 'There is a particular freedom in writing for no one. When the expectation of readership dissolves, what remains is the purest form of thought.',
    tags: ['reflection', 'writing', 'practice'],
    folder: 'Essays',
    wordCount: 178,
    readingTime: 1,
    createdAt: '2026-03-15T08:30:00Z',
    updatedAt: '2026-03-20T14:22:00Z',
    status: 'draft',
  },
  {
    id: '2',
    title: 'Notes on Film Criticism in the Streaming Age',
    content: `The economics of film criticism have inverted. Where once a handful of gatekeepers shaped public taste through newspaper columns and magazine reviews, now millions of voices compete in a marketplace of attention.

But something has been lost. The old model, for all its elitism, produced critics who watched deeply. They saw a film three times before writing about it. They placed it in context — historical, cultural, personal. They wrote with a patience that the algorithm does not reward.

Today's film discourse happens in real-time. A movie drops on a streaming platform and within hours there are thousands of takes, each racing to be first rather than best. The hot take has replaced the considered essay.

I don't mourn the gatekeepers. But I do mourn the pace. The best criticism I've read this year came from bloggers who waited — who let a film sit with them for weeks before putting pen to paper.

Speed is the enemy of insight. And in a world that rewards speed above all else, the careful critic becomes a kind of radical.`,
    excerpt: 'The economics of film criticism have inverted. Where once a handful of gatekeepers shaped public taste, now millions of voices compete.',
    tags: ['film', 'criticism', 'culture'],
    folder: 'Essays',
    wordCount: 192,
    readingTime: 1,
    createdAt: '2026-03-10T10:15:00Z',
    updatedAt: '2026-03-18T09:45:00Z',
    status: 'draft',
  },
  {
    id: '3',
    title: 'Reading Log: March 2026',
    content: `## Week 1

Started *The Master and Margarita* by Bulgakov. I've been meaning to read this for years, and now I understand why people speak of it with such reverence. The Devil's visit to Moscow is one of the great setups in literature.

Also finished *Four Thousand Weeks* by Oliver Burkeman. A meditation on time management that argues against time management. The central insight: you will never get everything done, so stop trying and choose what matters.

## Week 2

Deep into Bulgakov now. The chapters alternating between Moscow and Jerusalem are disorienting in the best way. Pontius Pilate has never felt more human.

Read two essays by Zadie Smith from *Feel Free*. Her piece on libraries made me want to spend every afternoon in one.

## Week 3

Finished *The Master and Margarita*. The ending is devastating and beautiful. Added it to my list of books I'll reread.

Started *Exercised* by Daniel Lieberman. Fascinating evolutionary perspective on why our bodies crave rest and how modern exercise is historically bizarre.`,
    excerpt: 'Started The Master and Margarita by Bulgakov. I have been meaning to read this for years, and now I understand why people speak of it with reverence.',
    tags: ['reading', 'books', 'log'],
    folder: 'Logs',
    wordCount: 195,
    readingTime: 1,
    createdAt: '2026-03-01T07:00:00Z',
    updatedAt: '2026-03-21T20:10:00Z',
    status: 'draft',
  },
  {
    id: '4',
    title: 'Why I Quit Social Media (Again)',
    content: `This is the third time I've quit social media, and I think this time it will stick. Not because I've developed some superhuman willpower, but because I've finally understood what I was using it for.

I wasn't using it for connection. I have a phone for that. I wasn't using it for news. I have RSS feeds for that. I was using it for validation — the small dopamine hit of a like, a retweet, a reply from someone I admire.

Once I named it, the spell broke. Validation-seeking is not inherently bad, but sourcing it from strangers on the internet is like trying to quench thirst with saltwater. Each sip makes you thirstier.

The first week was uncomfortable. The second week was boring. By the third week, I started reading books again. By the fourth, I started writing again — not for an audience, but for myself.

The irony of writing about quitting social media is not lost on me. But since no one will read this, the irony is harmless.`,
    excerpt: 'This is the third time I have quit social media, and I think this time it will stick. Not because of superhuman willpower, but because I finally understood.',
    tags: ['social-media', 'reflection', 'digital-life'],
    folder: 'Essays',
    wordCount: 189,
    readingTime: 1,
    createdAt: '2026-02-20T16:00:00Z',
    updatedAt: '2026-02-28T11:30:00Z',
    status: 'published',
  },
  {
    id: '5',
    title: 'Untitled',
    content: `The city at 5 AM is a different city. The same streets that bustle with commuters and tourists during the day become something else entirely in the predawn quiet.

I've been walking early for a month now. Not for exercise — for observation. The light is different. The sounds are different. Even the air tastes different, cleaner somehow, as if the night has scrubbed it.

This morning I saw a fox crossing the road near the park. It stopped and looked at me with an expression I can only describe as mild annoyance, as if I were the intruder in its world. Which, at that hour, I suppose I was.`,
    excerpt: 'The city at 5 AM is a different city. The same streets that bustle with commuters and tourists during the day become something else entirely.',
    tags: ['observation', 'city'],
    folder: null,
    wordCount: 118,
    readingTime: 1,
    createdAt: '2026-03-19T05:30:00Z',
    updatedAt: '2026-03-19T06:15:00Z',
    status: 'draft',
  },
];

export const mockFolders: Folder[] = [
  { id: 'f1', name: 'Essays', writingCount: 3 },
  { id: 'f2', name: 'Logs', writingCount: 1 },
  { id: 'f3', name: 'Ideas', writingCount: 0 },
];
