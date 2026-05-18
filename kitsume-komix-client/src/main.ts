import './assets/main.css'

import { OhVueIcon, addIcons } from "oh-vue-icons";
import { LaHomeSolid, IoLibrarySharp, HiSolidLibrary, MdLibrarybooksSharp, MdManageaccounts, MdLogout, IoArrowBack, IoGridOutline, IoList, IoPlayBack, IoPlayForward, IoPlaySkipBack, IoPlaySkipForward, IoCaretBackCircle, IoCaretForwardCircle, IoCaretDownCircle, BiArrowsExpand, BiArrowsCollapse, IoClose, IoSettingsSharp, IoDocument, IoBook, MdMenubookSharp, MdLocallibrary, IoPerson, IoLockClosed, IoPencilSharp, IoAddCircle, IoTrash, MdListRound, IoMenu, IoSearch, IoSunny, IoMoon, IoChevronBack, IoChevronForward, IoCheckmark, IoDownload, IoImage, IoArrowUp, MdList, MdGridviewSharp, MdFilteraltoff, MdFilteralt, MdTaskalt, MdAutostories, MdCalendarmonth, MdStarrateSharp, MdModeeditoutlineSharp, MdMenubookRound, IoCaretUp, IoCaretDown, IoRemoveCircleSharp, IoAddCircleSharp } from "oh-vue-icons/icons";
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from '@/App.vue';
import AppIcon from '@/components/icons/AppIcon.vue';
import tooltipDirective from '@/directives/tooltip';
import router from '@/router'


const app = createApp(App)

app.use(createPinia())

addIcons(LaHomeSolid, IoLibrarySharp, HiSolidLibrary, MdLibrarybooksSharp, MdManageaccounts, MdLogout, IoArrowBack, IoGridOutline, IoList, IoPlayBack, IoPlayForward, IoPlaySkipBack, IoPlaySkipForward, IoCaretBackCircle, IoCaretForwardCircle, IoCaretDownCircle, BiArrowsExpand, BiArrowsCollapse, IoClose, IoSettingsSharp, IoDocument, IoBook, MdMenubookSharp, MdLocallibrary, IoPerson, IoLockClosed, IoPencilSharp, IoAddCircle, IoTrash, MdListRound, IoMenu, IoSearch, IoSunny, IoMoon, IoChevronBack, IoChevronForward, IoCheckmark, IoDownload, IoImage, IoArrowUp, MdList, MdGridviewSharp, MdFilteraltoff, MdFilteralt, MdTaskalt, MdAutostories, MdCalendarmonth, MdStarrateSharp, MdModeeditoutlineSharp, MdMenubookRound, IoCaretUp, IoCaretDown, IoRemoveCircleSharp, IoAddCircleSharp );
app.component("v-icon", OhVueIcon);
app.component("AppIcon", AppIcon);

app.directive('tooltip', tooltipDirective);

app.use(router)
app.mount('#app')
