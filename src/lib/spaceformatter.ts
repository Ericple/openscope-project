/**
 * 清除字符串中多余的空格
 * @param source 原字符串
 * @returns 处理后的字符串
 */
export function CleanSpaces(source: string) : string
{
    source = source.trim();
    while( source.lastIndexOf("  ") !== -1 )
    {
        source = source.replace("  "," ");
    }
    return source;
}

export default {
    CleanSpaces
}