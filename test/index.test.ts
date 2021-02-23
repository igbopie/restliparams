import { toParams, toRestli, fromRestli } from '../src';

test('Restli to params works', () => {
  const result = toParams({
    a: '1',
    b: 'nacho',
    c: {
      d: 'a',
      e: 'b',
    },
    f: [
      {
        a: '2',
        b: 'nacho2',
      },
      {
        a: '3',
        b: 'nacho3',
        c: [{ hola: 'hola' }],
      },
    ],
  });
  expect(result).toBe('a=1&b=nacho&c=(d:a,e:b)&f=List((a:2,b:nacho2),(a:3,b:nacho3,c:List((hola:hola))))');
});

test('Restli convert and parse works', () => {
  const original = {
    a: '1',
    b: 'nacho',
    c: {
      d: 'a',
      e: 'b',
    },
    f: [
      {
        a: '2',
        b: 'nacho2',
      },
      {
        a: '3',
        b: 'nacho3',
        c: [{ hola: 'hola{}();vkj' }],
      },
    ],
  };
  const clone = fromRestli(toRestli(original));
  expect(clone).toMatchObject(original);
});

test('Restli convert and parse works with colons', () => {
  const original = {
    include: {
      and: [
        { or: { 'urn:li:adTargetingFacet:locations': ['urn:li:geo:102221843'] } },
        { or: { 'urn:li:adTargetingFacet:skills': ['urn:li:skill:17'] } },
      ],
    },
  };
  const clone = fromRestli(toRestli(original));
  expect(clone).toMatchObject(original);
});
