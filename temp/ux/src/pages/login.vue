<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card class="ub-login-card">
          <q-card-section class="ub-login-hdr text-white text-center">
            <img src="logo.png" style="height: 135px; width: 210px;" />
            <div class="text-h5 absolute-bottom" style="margin-bottom: 20px;">swagger-stats</div>
          </q-card-section>

          <q-card-section>
            <q-card-section>
              <q-input v-model="username" clearable label="Username" v-on:keyup.enter="handleLogin">
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
              <q-input v-model="password" type="password" clearable label="Password" v-on:keyup.enter="handleLogin">
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>
            </q-card-section>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn color="primary" unelevated @click="handleLogin">Login</q-btn>
          </q-card-actions>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapState, mapActions } from 'vuex';
export default {
  data() {
    return {
      username: '',
      password: ''
    };
  },
  computed: {
    dark: {
      get() {
        return this.$store.state.layout.dark;
      }
    }
  },
  mounted() {
    this.$q.dark.set(this.dark);
  },
  methods: {
    ...mapActions({
      login: 'login'
    }),
    handleLogin: async function() {
      let loginRes = await this.login({ username: this.username, password: this.password });
      if (loginRes.success) {
        this.$router.push('/');
      } else {
        this.$q.notify({
          position: 'top',
          type: 'negative',
          message: 'Authentication Failed',
          caption: loginRes.payload,
          progress: true,
        });
      }
    }
  }
};
</script>

<style lang="scss">
.ub-login-card {
  width: 100%;
  max-width: 400px;
  .ub-login-hdr {
    height: 200px;
    background: #0f2027; /* fallback for old browsers */
    background: -webkit-linear-gradient(to right, #2c5364, #203a43, #0f2027); /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(to right, #2c5364, #203a43, #0f2027); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  }
}
</style>
