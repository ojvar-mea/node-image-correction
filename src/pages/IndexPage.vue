<template>
  <q-page class="row items-center justify-evenly">
    <div class="col col-8">
      <image-process-component></image-process-component>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ImageProcessComponent from 'src/components/ImageProcessComponent.vue';

export default defineComponent({
  name: 'IndexPage',
  components: { ImageProcessComponent },
});
</script>
