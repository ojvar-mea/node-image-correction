<template>
  <q-form class="q-gutter-md" @submit="onFormSubmitHandler">
    <legend>
      <h4 class="h4">Image Processing</h4>
    </legend>

    <q-input
      v-model="model.source_folder"
      label="Source Folder"
      lazy-rules
      :rules="[
        (val) => (val && val.length) || 'Please type source folder path',
      ]"
    />

    <q-input
      v-model="model.target_folder"
      label="Taret Folder"
      lazy-rules
      :rules="[
        (val) => (val && val.length) || 'Please type target folder path',
      ]"
    />

    <div class="row">
      <div class="col">
        <q-select
          label="Rotation"
          v-model="model.rotate"
          :options="rotateSource"
        />
      </div>

      <div class="col col-auto">
        <q-circular-progress
          show-value
          class="text-light-blue q-ma-md"
          :value="currentFileIndex"
          :max="filesCount"
          size="64px"
          color="light-blue"
          v-if="isProcessingMode"
        />
      </div>
    </div>

    <div class="row">
      <q-label class="text-grey-8">Brithness %</q-label>
      <q-slider
        v-model="model.brightness"
        :min="0"
        :max="100"
        :step="10"
        label
        color="secondary"
        marker-labels
      />
    </div>

    <div class="row">
      <q-btn
        class="col-3"
        :label="startButtonLabel"
        :color="startButtonColor"
        type="submit"
      />
    </div>
  </q-form>
</template>

<script lang="ts">
import axios from 'axios';
import { defineComponent, reactive, ref, computed } from 'vue';

enum EnumRotate {
  'DEG_0' = 0,
  'DEG_45' = 45,
  'DEG_90' = 90,
  'DEG_180' = 180,
  'DEG_270' = 270,
}

type Model = {
  source_folder: string;
  target_folder: string;
  rotate: EnumRotate;
  brightness: number;
};

type FileProcessRequest = {
  filename: string;
  destination: string;
  basePath: string;
  rotate: number;
  brightness: number;
};

export default defineComponent({
  name: 'ImageProcessComponent',

  setup() {
    const SERVER_URL = 'http://localhost:4000';
    const GET_DIRECTORIES_URL = `${SERVER_URL}/directories`;
    const GET_FILES_URL = `${SERVER_URL}/files`;
    const GET_PROCESS_URL = `${SERVER_URL}/process`;

    const model = reactive<Model>({
      source_folder: '/home/ojvar/Pictures',
      target_folder: '/home/ojvar/Temp',
      rotate: EnumRotate.DEG_0,
      brightness: 0,
    });

    const getFoldersList = async (path: string): Promise<string[]> => {
      const data = await axios.post(GET_DIRECTORIES_URL, { path });
      return data.data;
    };
    const getFilesList = async (path: string): Promise<string[]> => {
      const data = await axios.post(GET_FILES_URL, { path });
      return data.data;
    };
    const processFile = async (data: FileProcessRequest) => {
      return axios.post(GET_PROCESS_URL, data);
    };

    const rotateSource = Object.values(EnumRotate).filter((x) => !isNaN(+x));
    const isProcessingMode = ref(false);
    const currentFileIndex = ref(0);
    const directories = ref<string[]>([]);
    const filesCount = computed(() => directories.value.length);
    const startButtonLabel = computed(() =>
      isProcessingMode.value ? 'Stop' : 'Start'
    );
    const startButtonColor = computed(() =>
      isProcessingMode.value ? 'warning' : 'primary'
    );
    const onFormSubmitHandler = async () => {
      if (isProcessingMode.value) {
        isProcessingMode.value = false;
        return;
      }

      currentFileIndex.value = 0;
      isProcessingMode.value = true;

      /* Get directories */
      directories.value = await getFoldersList(model.source_folder);
      console.log(directories.value);

      for (const directory of directories.value) {
        currentFileIndex.value++;
        if (!isProcessingMode.value) {
          break;
        }

        /* get files list */
        const files = await getFilesList(directory);
        console.log(directories.value);

        /* Process Images */
        for (const file of files) {
          if (!isProcessingMode.value) {
            break;
          }

          const requestData = {
            basePath: model.source_folder,
            destination: model.target_folder,
            brightness: 1 + model.brightness / 100.0,
            rotate: +model.rotate,
            filename: file,
          };
          console.log(file);
          await processFile(requestData);
        }
      }

      directories.value = [];
      currentFileIndex.value = 0;
      isProcessingMode.value = false;
    };

    return {
      model,
      startButtonColor,
      startButtonLabel,
      rotateSource,
      isProcessingMode,
      currentFileIndex,
      filesCount,
      folders: directories,
      onFormSubmitHandler,
    };
  },
});
</script>
