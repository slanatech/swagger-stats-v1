<script>
import RRRTableWithPreview from '@/components/rrrtablewithpreview.vue';
import { mapState, mapActions } from 'vuex';
export default {
  name: 'LongestRequests',
  extends: RRRTableWithPreview,
  data() {
    return {
      title: 'Longest Requests',
      icon: 'hourglass_empty',
      statsField: 'longestreq',
      sortField: 'responsetime',
      sortOrder: 'desc'
    };
  },
  computed: {
    ...mapState({
      statsUpdated: state => state.stats.updated,
      refreshTrigger: state => state.refreshTrigger,
      storedItems: state => state.longestrequests.items,
      expandedState: state => state.longestrequests.expanded
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
      addStoredItem: 'longestrequests/add',
      removeStoredItem: 'longestrequests/remove',
      setExpanded: 'longestrequests/setExpanded'
    })
  }
};
</script>
