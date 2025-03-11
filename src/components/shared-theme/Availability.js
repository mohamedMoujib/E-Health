import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Card,
  Divider,
  Stack,
  Input,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CardOverflow from "@mui/joy/CardOverflow";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile, fetchUserProfile } from "../../Redux/slices/userSlice";


const Availability = () => {
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.user.profile);
  const loading = useSelector((state) => state.user.loading);
  const schedule = userProfile?.schedule || [];
  
  // Component mount effect - fetch user profile once
  useEffect(() => {
    dispatch(fetchUserProfile());

  }, [dispatch]);
  
  // Map day codes to full day names
  const dayMapping = {
    lun: "Monday",
    mar: "Tuesday",
    mer: "Wednesday",
    jeu: "Thursday",
    ven: "Friday",
    sam: "Saturday",
    dim: "Sunday"
  };

  const getPeriodTimes = (schedule, day, index) => {
    const foundDay = schedule?.find((s) => s.day === day);
    return foundDay?.periods?.[index] || { startTime: "", endTime: "" };
  };
  
  // Initialize form with react-hook-form
  const { control, handleSubmit, reset } = useForm();
  
  // Initialize toggles state when userProfile changes
  const [enabledDays, setEnabledDays] = useState({});
  const [showSecondRange, setShowSecondRange] = useState({});
  
  // This useEffect will update the form and state when profile data changes
  useEffect(() => {
    if (userProfile && schedule) {
      console.log("Profile updated, resetting form", userProfile);
      
      // Set enabled days based on schedule
      const newEnabledDays = {
        lun: !!schedule.find((s) => s.day === "Monday"),
        mar: !!schedule.find((s) => s.day === "Tuesday"),
        mer: !!schedule.find((s) => s.day === "Wednesday"),
        jeu: !!schedule.find((s) => s.day === "Thursday"),
        ven: !!schedule.find((s) => s.day === "Friday"),
        sam: !!schedule.find((s) => s.day === "Saturday"),
        dim: !!schedule.find((s) => s.day === "Sunday"),
      };
      setEnabledDays(newEnabledDays);
      
      // Set second range visibility
      const newShowSecondRange = {
        lun: schedule.find((s) => s.day === "Monday")?.periods?.length > 1 || false,
        mar: schedule.find((s) => s.day === "Tuesday")?.periods?.length > 1 || false,
        mer: schedule.find((s) => s.day === "Wednesday")?.periods?.length > 1 || false,
        jeu: schedule.find((s) => s.day === "Thursday")?.periods?.length > 1 || false,
        ven: schedule.find((s) => s.day === "Friday")?.periods?.length > 1 || false,
        sam: schedule.find((s) => s.day === "Saturday")?.periods?.length > 1 || false,
        dim: schedule.find((s) => s.day === "Sunday")?.periods?.length > 1 || false,
      };
      setShowSecondRange(newShowSecondRange);
      
      // Reset form with new values
      reset({
        lunStart1: getPeriodTimes(schedule, "Monday", 0).startTime || "",
        lunEnd1: getPeriodTimes(schedule, "Monday", 0).endTime || "",
        lunStart2: getPeriodTimes(schedule, "Monday", 1)?.startTime || "",
        lunEnd2: getPeriodTimes(schedule, "Monday", 1)?.endTime || "",
      
        marStart1: getPeriodTimes(schedule, "Tuesday", 0).startTime || "",
        marEnd1: getPeriodTimes(schedule, "Tuesday", 0).endTime || "",
        marStart2: getPeriodTimes(schedule, "Tuesday", 1)?.startTime || "",
        marEnd2: getPeriodTimes(schedule, "Tuesday", 1)?.endTime || "",
      
        merStart1: getPeriodTimes(schedule, "Wednesday", 0).startTime || "",
        merEnd1: getPeriodTimes(schedule, "Wednesday", 0).endTime || "",
        merStart2: getPeriodTimes(schedule, "Wednesday", 1)?.startTime || "",
        merEnd2: getPeriodTimes(schedule, "Wednesday", 1)?.endTime || "",
      
        jeuStart1: getPeriodTimes(schedule, "Thursday", 0).startTime || "",
        jeuEnd1: getPeriodTimes(schedule, "Thursday", 0).endTime || "",
        jeuStart2: getPeriodTimes(schedule, "Thursday", 1)?.startTime || "",
        jeuEnd2: getPeriodTimes(schedule, "Thursday", 1)?.endTime || "",
      
        venStart1: getPeriodTimes(schedule, "Friday", 0).startTime || "",
        venEnd1: getPeriodTimes(schedule, "Friday", 0).endTime || "",
        venStart2: getPeriodTimes(schedule, "Friday", 1)?.startTime || "",
        venEnd2: getPeriodTimes(schedule, "Friday", 1)?.endTime || "",
      
        samStart1: getPeriodTimes(schedule, "Saturday", 0).startTime || "",
        samEnd1: getPeriodTimes(schedule, "Saturday", 0).endTime || "",
        samStart2: getPeriodTimes(schedule, "Saturday", 1)?.startTime || "",
        samEnd2: getPeriodTimes(schedule, "Saturday", 1)?.endTime || "",
      
        dimStart1: getPeriodTimes(schedule, "Sunday", 0).startTime || "",
        dimEnd1: getPeriodTimes(schedule, "Sunday", 0).endTime || "",
        dimStart2: getPeriodTimes(schedule, "Sunday", 1)?.startTime || "",
        dimEnd2: getPeriodTimes(schedule, "Sunday", 1)?.endTime || "",
      });
    }
  }, [userProfile, reset]);

  const onSubmit = async (data) => {
    const formattedSchedule = [];
  
    // Process each day
    Object.keys(enabledDays).forEach(dayCode => {
      if (enabledDays[dayCode]) {
        const dayName = dayMapping[dayCode];
        const periods = [];
        
        // First time period
        if (data[`${dayCode}Start1`] && data[`${dayCode}End1`]) {
          periods.push({
            startTime: data[`${dayCode}Start1`],
            endTime: data[`${dayCode}End1`]
          });
        }
        
        // Second time period (if enabled)
        if (showSecondRange[dayCode] && data[`${dayCode}Start2`] && data[`${dayCode}End2`]) {
          periods.push({
            startTime: data[`${dayCode}Start2`],
            endTime: data[`${dayCode}End2`]
          });
        }
        
        if (periods.length > 0) {
          formattedSchedule.push({
            day: dayName,
            periods: periods
          }); 
        }
      }
    });
  
    const formData = new FormData();
    formData.append('schedule', JSON.stringify(formattedSchedule));
  
    await dispatch(updateUserProfile(formData))
      .then(async () => {
        console.log("Schedule updated successfully");
        await dispatch(fetchUserProfile()); // Refresh profile data after failure

        // Optionally, you can show a success message
      })
      .catch(async (error) => {
        console.error("Failed to update schedule:", error);
        await dispatch(fetchUserProfile()); // Refresh profile data after failure
  
        // Optionally, show an error message
      });
  };
  

  const handleDayToggle = (day) => {
    setEnabledDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleSecondRangeToggle = (day) => {
    setShowSecondRange((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleCancel = () => {
    // Force refetch from server to ensure we're using the latest data
    dispatch(fetchUserProfile());
  };

  return (
    <Card>
      {/* Title Section */}
      <Box sx={{ mb: 2, px: 3, py: 2 }}>
        <Typography
          level="title-md"
          sx={{
            fontSize: "1.25rem",
            fontWeight: "bold",
            color: "#1A2027",
          }}
        >
          Disponibilité
        </Typography>
        <Typography
          level="body-sm"
          sx={{
            fontSize: "0.875rem",
            color: "#4A5568",
          }}
        >
          Personnalisez votre calendrier de disponibilité.
        </Typography>
      </Box>

      {/* Divider */}
      <Divider />

      {/* Days and Time Ranges */}
      <Stack spacing={3} sx={{ px: 3, py: 2 }}>
        {/* Render two days in a row */}
        {["lun", "mar", "mer", "jeu", "ven", "sam", "dim"].reduce((rows, key, index, array) => {
          if (index % 2 === 0) {
            rows.push(array.slice(index, index + 2));
          }
          return rows;
        }, []).map((pair, rowIndex) => (
          <Grid container spacing={2} key={rowIndex}>
            {pair.map((day) => (
              <Grid item xs={6} key={day}>
                {/* Day Toggle */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={enabledDays[day] || false}
                      onChange={() => handleDayToggle(day)}
                      size="small"
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#4A5568",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#4A5568",
                        },
                      }}
                    />
                  }
                  label={`${day.charAt(0).toUpperCase() + day.slice(1)} - Disponible`} 
                  labelPlacement="start"
                  sx={{
                    mr: 0,
                    "& .MuiTypography-root": {
                      fontSize: "0.875rem",
                      color: "#4A5568",
                    },
                  }}
                />

                {/* First Time Range */}
                {enabledDays[day] && (
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Controller
                      name={`${day}Start1`}
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          {...field}
                          size="sm"
                          placeholder="(HH:mm)"
                          startDecorator={<AccessTimeIcon />}
                          type="text"
                          sx={{
                            flexGrow: 1,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1,
                              height: "36px",
                              "& fieldset": {
                                borderColor: "#e0e0e0",
                              },
                            },
                            "& .MuiInputBase-input": {
                              fontSize: "0.875rem",
                              color: "#1A2027",
                            },
                          }}
                        />
                      )}
                    />
                    <Controller
                      name={`${day}End1`}
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          {...field}
                          size="sm"
                          placeholder="(HH:mm)"
                          startDecorator={<AccessTimeIcon />}
                          type="text"
                          sx={{
                            flexGrow: 1,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1,
                              height: "36px",
                              "& fieldset": {
                                borderColor: "#e0e0e0",
                              },
                            },
                            "& .MuiInputBase-input": {
                              fontSize: "0.875rem",
                              color: "#1A2027",
                            },
                          }}
                        />
                      )}
                    />
                  </Stack>
                )}

                {/* Second Time Range Toggle */}
                {enabledDays[day] && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showSecondRange[day] || false}
                        onChange={() => handleSecondRangeToggle(day)}
                        size="small"
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#4A5568",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            backgroundColor: "#4A5568",
                          },
                        }}
                      />
                    }
                    label="Ajouter une deuxième plage horaire"
                    sx={{
                      "& .MuiTypography-root": {
                        fontSize: "0.875rem",
                        color: "#4A5568",
                      },
                    }}
                  />
                )}

                {/* Second Time Range */}
                {enabledDays[day] && showSecondRange[day] && (
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Controller
                      name={`${day}Start2`}
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          {...field}
                          size="sm"
                          placeholder="(HH:mm)"
                          startDecorator={<AccessTimeIcon />}
                          type="text"
                          sx={{
                            flexGrow: 1,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1,
                              height: "36px",
                              "& fieldset": {
                                borderColor: "#e0e0e0",
                              },
                            },
                            "& .MuiInputBase-input": {
                              fontSize: "0.875rem",
                              color: "#1A2027",
                            },
                          }}
                        />
                      )}
                    />
                    <Controller
                      name={`${day}End2`}
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          {...field}
                          size="sm"
                          placeholder="(HH:mm)"
                          startDecorator={<AccessTimeIcon />}
                          type="text"
                          sx={{
                            flexGrow: 1,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1,
                              height: "36px",
                              "& fieldset": {
                                borderColor: "#e0e0e0",
                              },
                            },
                            "& .MuiInputBase-input": {
                              fontSize: "0.875rem",
                              color: "#1A2027",
                            },
                          }}
                        />
                      )}
                    />
                  </Stack>
                )}
              </Grid>
            ))}
          </Grid>
        ))}
      </Stack>

      {/* Save and Cancel Buttons */}
      <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={2}
          sx={{ p: 2, ml: 65}}
        >
          {/* Cancel Button */}
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={handleCancel}
            disabled={loading}
          >
            Annuler
          </Button>

          {/* Save Button */}
          <Button
            size="sm"
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            color="primary"
            disabled={loading}
          >
            {loading ? "Sauvegarde en cours..." : "Sauvegarder"}
          </Button>
        </Stack>
      </CardOverflow>
    </Card>
  );
};

export default Availability;