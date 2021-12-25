<!-- This example requires Tailwind CSS v2.0+ -->
<template>

  <div class="ring-1 ring-black ring-opacity-5 md:w-80 w-0">
    <div class="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
      <a v-for="item in solutions" :key="item.name" :href="item.href" class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50">
        <component :is="item.icon" class="flex-shrink-0 h-6 w-6 text-indigo-600" aria-hidden="true" />
        <div class="ml-4">
          <p class="text-base font-medium text-gray-900">
            {{ item.name }}
          </p>
          <p class="mt-1 text-sm text-gray-500">
            {{ item.description }}
          </p>
        </div>
      </a>
    </div>
  </div>

</template>

<script>
import { Popover, PopoverButton, PopoverGroup, PopoverPanel } from '@headlessui/vue'
import {
  BookmarkAltIcon,
  CalendarIcon,
  ChartBarIcon,
  CursorClickIcon,
  MenuIcon,
  PhoneIcon,
  PlayIcon,
  RefreshIcon,
  ShieldCheckIcon,
  SupportIcon,
  ViewGridIcon,
  XIcon,
} from '@heroicons/vue/outline'
import { ChevronDownIcon } from '@heroicons/vue/solid'

const solutions = [
  {
    name: 'Analytics',
    description: 'Get a better understanding of where your traffic is coming from.',
    href: '#',
    icon: ChartBarIcon,
  },
  {
    name: 'Engagement',
    description: 'Speak directly to your customers in a more meaningful way.',
    href: '#',
    icon: CursorClickIcon,
  },
  { name: 'Security', description: "Your customers' data will be safe and secure.", href: '#', icon: ShieldCheckIcon },
  {
    name: 'Integrations',
    description: "Connect with third-party tools that you're already using.",
    href: '#',
    icon: ViewGridIcon,
  },
  {
    name: 'Automations',
    description: 'Build strategic funnels that will drive your customers to convert',
    href: '#',
    icon: RefreshIcon,
  },
]

export default {
  components: {
    Popover,
    PopoverButton,
    PopoverGroup,
    PopoverPanel,
    ChevronDownIcon,
    MenuIcon,
    XIcon,
  },
  setup() {
    return {
      solutions,
    }
  },
}
</script>
