export const userImageLetter = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
    'k', 'l', 'm', 'n', 'o', 'p', 'e', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y', 'z'
]

export function getProfileImageSource(username: string) {
    const letter = username?.charAt(0).toLowerCase();

    return userImageLetter.includes(letter)
        ? `/pp/${letter}.png`
        : `/pp/default.png`;
}