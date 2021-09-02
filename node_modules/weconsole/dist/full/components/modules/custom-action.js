import { promiseifyApi, wcScope } from '../../modules/util';
const WcScope = wcScope();
export const SystemInfoCustomAction = {
    id: 'NativeInfo',
    title: '内置信息',
    autoCase: 'SystemInfo',
    cases: [
        {
            id: 'SystemInfo',
            button: '系统信息',
            showMode: "json" /* json */,
            handler() {
                return promiseifyApi('getSystemInfo');
            }
        },
        {
            id: 'Global',
            button: 'Global对象',
            showMode: "json" /* json */,
            handler() {
                return typeof global !== 'undefined' ? global : undefined;
            }
        },
        {
            id: 'App',
            button: 'App对象',
            showMode: "json" /* json */,
            handler() {
                return getApp({ allowDefault: true });
            }
        },
        {
            id: 'CurrentPage',
            button: '当前页面实例',
            showMode: "json" /* json */,
            handler() {
                const pages = getCurrentPages();
                return (pages === null || pages === void 0 ? void 0 : pages.length) ? pages[pages.length - 1] : undefined;
            }
        }
    ]
};
const demoActions = [
// {
//     id: "test1",
//     title: "显示文本",
//     autoCase: "show",
//     cases: [
//         {
//             id: "show",
//             button: "查看",
//             showMode: WcCustomActionShowMode.text,
//             handler(): string {
//                 return "测试文本";
//             },
//         },
//         {
//             id: "show2",
//             button: "查看2",
//             showMode: WcCustomActionShowMode.text,
//             handler(): string {
//                 return "测试文本2";
//             },
//         },
//     ],
// },
// {
//     id: "test2",
//     title: "显示JSON",
//     autoCase: "show",
//     cases: [
//         {
//             id: "show",
//             button: "查看",
//             showMode: WcCustomActionShowMode.json,
//             handler() {
//                 return wx;
//             },
//         },
//     ],
// },
// {
//     id: "test3",
//     title: "显示表格",
//     autoCase: "show",
//     cases: [
//         {
//             id: "show",
//             button: "查看",
//             showMode: WcCustomActionShowMode.grid,
//             handler(): WcCustomActionGrid {
//                 return {
//                     cols: [
//                         {
//                             title: "Id",
//                             field: "id",
//                             width: 30,
//                         },
//                         {
//                             title: "Name",
//                             field: "name",
//                             width: 70,
//                         },
//                     ],
//                     data: [
//                         {
//                             id: 1,
//                             name: "Tom",
//                         },
//                         {
//                             id: 2,
//                             name: "Alice",
//                         },
//                     ],
//                 };
//             },
//         },
//     ],
// },
];
export const getCustomActions = () => {
    const res = [SystemInfoCustomAction, ...demoActions];
    const config = WcScope.UIConfig;
    if ((config === null || config === void 0 ? void 0 : config.customActions) && config.customActions.length) {
        return res.concat(config.customActions);
    }
    return res;
};
