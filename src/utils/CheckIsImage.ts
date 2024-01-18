

export const checkIsImage = (url) => {
    if(/.jpeg$/.test(url)||/.png$/.test(url)||/.jfif$/.test(url)||/.bmp$/.test(url)||/.jpg$/.test(url))
    {
        return true;
    }
    else
    {
        return false;
    }
}