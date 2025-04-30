import { init } from '@paralleldrive/cuid2';

const generateShortId = init({ length: 8 });

export { generateShortId };