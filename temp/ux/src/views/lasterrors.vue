<script>
import RRRTableWithPreview from '@/components/rrrtablewithpreview.vue';
import { mapState, mapActions } from 'vuex';
export default {
  name: 'LongestRequests',
  extends: RRRTableWithPreview,
  data() {
    return {
      title: 'Last Errors',
      icon: 'error_outline',
      statsField: 'lasterrors',
      sortField: '@timestamp',
      sortOrder: 'desc'
    };
  },
  computed: {
    ...mapState({
      statsUpdated: state => state.stats.updated,
      refreshTrigger: state => state.refreshTrigger,
      storedItems: state => state.lasterrors.items,
      expandedState: state => state.lasterrors.expanded
    })
  },
  watch: {
    refreshTrigger: {
      handler: function() {
        this.getStats({ fields: [this.statsField] });
      }
    }
  },
  methods: {
    ...mapActions({
      getStats: 'stats/getStats',
      addStoredItem: 'lasterrors/add',
      removeStoredItem: 'lasterrors/remove',
      setExpanded: 'lasterrors/setExpanded'
    })
  }
};
</script>
