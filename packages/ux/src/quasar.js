import Vue from 'vue';

import './styles/quasar.scss';
import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css';
//import '@quasar/extras/eva-icons/eva-icons.css';

import {
  Quasar,
  Ripple,
  LoadingBar,
  Notify,
  QLayout,
  QHeader,
  QDrawer,
  QPageContainer,
  QPage,
  QPageSticky,
  QToolbar,
  QToolbarTitle,
  QBtn,
  QIcon,
  QList,
  QItem,
  QItemSection,
  QItemLabel,
  QSplitter,
  QScrollArea,
  QExpansionItem,
  QAvatar,
  QBtnToggle,
  QSeparator,
  QTooltip,
  QTable,
  QCard,
  QCardSection,
  QCardActions,
  QSelect,
  QToggle,
  QBadge,
  QSpace,
  QInput,
  QImg,
  QBar
} from 'quasar';

Vue.use(Quasar, {
  config: {},
  components: {
    QLayout,
    QHeader,
    QDrawer,
    QPageContainer,
    QPage,
    QPageSticky,
    QToolbar,
    QToolbarTitle,
    QBtn,
    QIcon,
    QList,
    QItem,
    QItemSection,
    QItemLabel,
    QSplitter,
    QScrollArea,
    QExpansionItem,
    QAvatar,
    QBtnToggle,
    QSeparator,
    QTooltip,
    QTable,
    QCard,
    QCardSection,
    QCardActions,
    QSelect,
    QToggle,
    QBadge,
    QSpace,
    QInput,
    QImg,
    QBar
  },
  directives: {
    Ripple
  },
  plugins: {
    LoadingBar,
    Notify
  }
});
