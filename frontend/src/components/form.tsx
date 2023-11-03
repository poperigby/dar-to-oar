import {
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  TextField,
  Tooltip,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import ConvertButton from "./buttons/convert_btn";
import Grid from "@mui/material/Unstable_Grid2";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import toast from "react-hot-toast";
import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { LogFileButton } from "@/components/buttons/log_file_btn";
import { LogLevel, convertDar2oar } from "@/tauri_cmd";
import { RemoveOarBtn } from "@/components/buttons/remove_oar_btn";
import {
  SelectLogLevel,
  selectLogLevel,
} from "@/components/lists/select_log_level";
import { SelectPathButton } from "@/components/buttons/path_selector";
import { UnhideDarBtn } from "@/components/buttons/unhide_dar_btn";
import { listen } from "@tauri-apps/api/event";
import LinearWithValueLabel from "./progress_bar";

type FormProps = {
  src: string;
  dist: string;
  modName: string;
  modAuthor: string;
  mappingPath: string;
  mapping1personPath: string;
  loading: boolean;
  logLevel: LogLevel;
  runParallel: boolean;
  hideDar: boolean;
  showProgress: boolean;
  progress: number;
};

export function ConvertForm() {
  const { register, handleSubmit, control, setValue, getValues } = useForm({
    mode: "onBlur",
    criteriaMode: "all",
    shouldFocusError: false,
    defaultValues: {
      src: localStorage.getItem("src") ?? "",
      dist: localStorage.getItem("dist") ?? "",
      modName: localStorage.getItem("modName") ?? "",
      modAuthor: localStorage.getItem("modAuthor") ?? "",
      mappingPath: localStorage.getItem("mappingPath") ?? "",
      mapping1personPath: localStorage.getItem("mapping1personPath") ?? "",
      loading: false as boolean,
      logLevel: selectLogLevel(localStorage.getItem("logLevel") ?? "error"),
      runParallel: localStorage.getItem("runParallel") === "true",
      hideDar: localStorage.getItem("hideDar") === "true",
      showProgress: localStorage.getItem("showProgress") === "true",
      progress: 0,
    } satisfies FormProps,
  });

  const setStorage = (key: keyof FormProps) => {
    return (value: string) => {
      localStorage.setItem(key, value);
      setValue(key, value);
    };
  };

  const setLoading = (loading: boolean) => {
    setValue("loading", loading);
  };

  const handleAllClear = () => {
    setStorage("dist")("");
    setStorage("mapping1personPath")("");
    setStorage("mappingPath")("");
    setStorage("modAuthor")("");
    setStorage("modName")("");
    setStorage("src")("");
  };

  const onSubmit: SubmitHandler<FormProps> = async ({
    src,
    dist,
    modName,
    modAuthor,
    mappingPath,
    mapping1personPath,
    runParallel,
    hideDar,
    showProgress,
  }) => {
    setLoading(true);

    let unlisten: (() => void) | null = null;
    try {
      setValue("progress", 0);
      let maxNum = 0;
      let prog = 0;

      unlisten = await listen<{ index: number }>("show-progress", (event) => {
        if (maxNum === 0) {
          maxNum = event.payload.index;
        } else {
          prog = event.payload.index;
        }
        setValue("progress", (prog * 100) / maxNum);
      });

      const completeInfo = await convertDar2oar({
        src,
        dist,
        modName,
        modAuthor,
        mappingPath,
        mapping1personPath,
        runParallel,
        hideDar,
        showProgress,
      });
      toast.success(completeInfo);
      setValue("progress", 100);
    } catch (err) {
      toast.error(`${err}`);
    } finally {
      if (unlisten) {
        unlisten();
      }
      setLoading(false);
    }
  };

  return (
    <Grid
      sx={{ display: "block", width: "95vw" }}
      container
      component="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormGroup onSubmit={handleSubmit(onSubmit)}>
        <Button
          sx={{ width: "100%", marginBottom: "35px" }}
          onClick={handleAllClear}
          startIcon={<ClearAllIcon />}
          variant="outlined"
        >
          <span>All Clear</span>
        </Button>

        <Controller
          name="src"
          control={control}
          rules={{
            required: "Need Path",
          }}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Grid container spacing={2}>
              <Grid xs={10}>
                <TextField
                  sx={{ width: "100%" }}
                  label="DAR(src) Directory"
                  placeholder="[...]/<MOD NAME>"
                  required
                  value={value}
                  variant="outlined"
                  margin="dense"
                  onChange={(e) => {
                    localStorage.setItem("src", e.target.value);
                    onChange(e);
                  }}
                  onBlur={onBlur}
                  error={Boolean(error)}
                  helperText={
                    <>
                      [Required] Path of dir containing
                      &quot;DynamicAnimationReplacer&quot;.
                      <br />
                      &quot;C:\\[...]/Mod Name/&quot; -&gt; Convert 1st & 3rd
                      person
                      <br />
                      &quot;[...]/animations/DynamicAnimationReplacer/&quot;
                      -&gt; Convert 3rd person
                    </>
                  }
                />
              </Grid>

              <Grid xs={2}>
                <SelectPathButton
                  path={value}
                  isDir
                  setValue={setStorage("src")}
                />
              </Grid>
            </Grid>
          )}
        />

        <Controller
          name="dist"
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Grid container spacing={2}>
              <Grid xs={10}>
                <TextField
                  sx={{ width: "100%" }}
                  label="OAR(dist) Directory"
                  placeholder="<MOD NAME>"
                  value={value}
                  variant="outlined"
                  margin="dense"
                  onChange={(e) => {
                    localStorage.setItem("dist", e.target.value);
                    onChange(e);
                  }}
                  onBlur={onBlur}
                  error={Boolean(error)}
                  helperText={
                    '[Optional] Creates a OAR path in specified directory.(e.g. "NewMod" -> "NewMod/meshes/[...])'
                  }
                />
              </Grid>
              <Grid xs={2}>
                <SelectPathButton
                  path={value}
                  isDir
                  setValue={setStorage("dist")}
                />
              </Grid>
            </Grid>
          )}
        />

        <Controller
          name="mappingPath"
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Grid container spacing={2}>
              <Grid xs={10}>
                <TextField
                  sx={{ width: "100%" }}
                  label="Mapping Table Path"
                  placeholder="./mapping_table.txt"
                  value={value}
                  variant="outlined"
                  margin="dense"
                  onChange={(e) => {
                    localStorage.setItem("mappingPath", e.target.value);
                    onChange(e);
                  }}
                  onBlur={onBlur}
                  error={Boolean(error)}
                  helperText={<MappingHelpBtn />}
                />
              </Grid>

              <Grid xs={2}>
                <SelectPathButton
                  path={value}
                  setValue={setStorage("mappingPath")}
                />
              </Grid>
            </Grid>
          )}
        />

        <Controller
          name="mapping1personPath"
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Grid container spacing={2}>
              <Grid xs={10}>
                <TextField
                  sx={{ minWidth: "100%" }}
                  label="Mapping Table Path(For _1st_person)"
                  placeholder="./mapping_table_for_1st_person.txt"
                  value={value}
                  variant="outlined"
                  margin="dense"
                  onChange={(e) => {
                    localStorage.setItem("mapping1personPath", e.target.value);
                    onChange(e);
                  }}
                  onBlur={onBlur}
                  error={Boolean(error)}
                  helperText={
                    "[Optional] File path that helps map priority number to a section name."
                  }
                />
              </Grid>

              <Grid xs={2}>
                <SelectPathButton
                  path={value}
                  setValue={setStorage("mapping1personPath")}
                />
              </Grid>
            </Grid>
          )}
        />

        <Grid container spacing={2}>
          <Grid xs={4}>
            <Controller
              name="modName"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextField
                  label="Mod Name"
                  placeholder="Mod Name"
                  value={value}
                  variant="outlined"
                  margin="dense"
                  onChange={(e) => {
                    localStorage.setItem("modName", e.target.value);
                    onChange(e);
                  }}
                  onBlur={onBlur}
                  error={Boolean(error)}
                  helperText={"[Optional]"}
                />
              )}
            />
          </Grid>

          <Grid xs={4}>
            <Controller
              name="modAuthor"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextField
                  label="Mod Author Name"
                  placeholder="Name"
                  value={value}
                  variant="outlined"
                  margin="dense"
                  onChange={(e) => {
                    localStorage.setItem("modAuthor", e.target.value);
                    onChange(e);
                  }}
                  onBlur={onBlur}
                  error={Boolean(error)}
                  helperText={"[Optional]"}
                />
              )}
            />
          </Grid>

          <Grid xs={4}>
            <LogFileButton />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid xs={3}>
            <Controller
              name="showProgress"
              control={control}
              render={({ field: { value } }) => (
                <Tooltip
                  title={
                    <>
                      <p>Display detail progress</p>
                      <p>
                        However, conversion may be delayed by 5~10 seconds or
                        more.
                      </p>
                    </>
                  }
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        onClick={() => {
                          setValue("showProgress", !value);
                          localStorage.setItem("showProgress", `${!value}`);
                        }}
                        checked={value}
                        aria-label="Show Progress"
                      />
                    }
                    label={
                      <Box component="div" sx={{ display: "flex" }}>
                        <SlideshowIcon />
                        ProgressBar
                      </Box>
                    }
                  />
                </Tooltip>
              )}
            />
          </Grid>

          <Grid xs={3}>
            <Controller
              name="hideDar"
              control={control}
              render={({ field: { value } }) => (
                <Tooltip
                  title={
                    <p>
                      After conversion, append &quot;.mohidden&quot; to the DAR
                      dirname in &quot;DAR(src) Directory*&quot; to make it a
                      hidden directory(For MO2 users)
                      <br />
                      NOTE: Failure to cross the drive or No permission.
                    </p>
                  }
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        onClick={() => {
                          localStorage.setItem("hideDar", `${!value}`);
                          setValue("hideDar", !value);
                        }}
                        checked={value}
                        aria-label="Hide DAR"
                      />
                    }
                    label={
                      <Box component="div" sx={{ display: "flex" }}>
                        <VisibilityOffIcon />
                        Hide DAR
                      </Box>
                    }
                  />
                </Tooltip>
              )}
            />
          </Grid>

          <Grid xs={3}>
            <UnhideDarBtn path={getValues("src")} />
          </Grid>
          <Grid xs={3}>
            <RemoveOarBtn
              darPath={getValues("src")}
              oarPath={getValues("dist")}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid xs={3}>
            <Controller
              name="runParallel"
              control={control}
              render={({ field: { value } }) => (
                <Tooltip
                  title={
                    <p>
                      Use multi-threading.
                      <br />
                      In most cases, it slows down by tens of ms, but may be
                      effective when there is more weight on CPU processing with
                      fewer files to copy and more logic parsing of
                      &quot;_condition.txt&quot;
                    </p>
                  }
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        onClick={() => {
                          localStorage.setItem("runParallel", `${!value}`);
                          setValue("runParallel", !value);
                        }}
                        checked={value}
                        aria-label="Run Parallel"
                      />
                    }
                    label="Run Parallel"
                  />
                </Tooltip>
              )}
            />
          </Grid>

          <Grid xs={3}>
            <Controller
              name="logLevel"
              control={control}
              render={({ field: { value } }) => (
                <SelectLogLevel value={value} {...register("logLevel")} />
              )}
            />
          </Grid>
        </Grid>

        <Controller
          name="loading"
          control={control}
          render={({ field: { value } }) => (
            <Box sx={{ width: "100%", paddingTop: "30px" }}>
              <ConvertButton loading={value} setLoading={setLoading} />
            </Box>
          )}
        />

        <Controller
          name="progress"
          control={control}
          render={({ field: { value } }) => (
            <LinearWithValueLabel progress={value} />
          )}
        />
      </FormGroup>
    </Grid>
  );
}

function MappingHelpBtn() {
  const handleMappingClick = () =>
    open(
      "https://github.com/SARDONYX-sard/dar-to-oar/wiki#what-is-the-mapping-file",
    );

  return (
    <>
      [Optional] File path that helps map priority number to a section name.
      <br />
      See{" "}
      <a
        style={{ cursor: "pointer", color: "#00c2ff" }}
        onClick={handleMappingClick}
        onKeyDown={handleMappingClick}
      >
        [What is the mapping file?]
      </a>
      (Jump to wiki)
    </>
  );
}
