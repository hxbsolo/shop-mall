import { wcScope, wcScopeSingle } from '../../modules/util';
import { ReaderStateController } from '../modules/reader-state';
import { MpApiCategoryMap, reportCategoryMapToList } from '../modules/category';
const WcScope = wcScope();
export const MainStateController = wcScopeSingle('MainStateController', () => new ReaderStateController('Main'));
wcScopeSingle('ApiStateController', () => new ReaderStateController('Api', () => wcScopeSingle('ProductController')));
wcScopeSingle('ConsoleStateController', () => new ReaderStateController('Console', () => wcScopeSingle('ProductController')));
if (!WcScope.UIConfig) {
    WcScope.UIConfig = {};
}
const defaultConfig = {
    apiCategoryGetter(product) {
        if ((product.category || '').startsWith('cloud')) {
            return 'cloud';
        }
        return MpApiCategoryMap[product.category] || 'other';
    },
    apiCategoryList: reportCategoryMapToList(MpApiCategoryMap)
};
for (const prop in defaultConfig) {
    if (!WcScope.UIConfig[prop]) {
        WcScope.UIConfig[prop] = defaultConfig[prop];
    }
}
