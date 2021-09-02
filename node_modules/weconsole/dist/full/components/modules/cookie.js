export const parseCookie = (content) => {
    const arr = content.split(';');
    const [name, val] = arr[0].split('=');
    const res = {
        name,
        value: val || ''
    };
    // TODO:解析其他属性
    return res;
};
