 /**
 * Checks whether the given text contains any profanities
 * from the supplied list, ensuring they are isolated words.
 *
 * @param {string} text - The user-generated content to check.
 * @param {string[]} profanities - An array of profane words.
 * @return {boolean} - True if profanity found, otherwise false.
 */
export function containsProfanity(text : string, profanities : string[]) {
    const wordsFound = []

    for (const profanity of profanities) {
      const regex = new RegExp(`(^|[^a-zA-Z])${profanity}(?=[^a-zA-Z]|$)`, 'i');
      
      if (regex.test(text)) {
        wordsFound.push(profanity); 
      }
    }
    return wordsFound;
}
