/*
Author: Dennis Hulett
Created: 5/30/2026
Last Edited: 6/1/2026

This is the script for setting the correct modules to display when creating
a diary log. It saves the user's selected settings locally for easy persistence.

*/

import { useState, useCallback } from "react";
import { AVAILABLE_MODULES, type ModuleKey } from "./models";

const STORAGE_KEY = "module_preferences"; //storage key to be sent to localstorage

const getDefaults = (): ModuleKey[] =>
  AVAILABLE_MODULES.map((m) => m.key as ModuleKey);

const load = (): ModuleKey[] => {
  //loads saved preferences if there, otherwise
  //loads default (all of them active)
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : getDefaults();
  } catch {
    return getDefaults();
  }
};

const save = (modules: ModuleKey[]) =>
  //saves selected modules locally
  localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));

export const useModulePreferences = () => {
  //this func is sent to the settings page
  const [activeModules, setActiveModules] = useState<ModuleKey[]>(load);

  const isActive = useCallback(
    //shows whether setting is active or not
    (key: ModuleKey) => activeModules.includes(key),
    [activeModules],
  );

  const toggle = useCallback((key: ModuleKey) => {
    //allows user to toggle settings on and off
    //stores the previous state of the settings and updates them
    //with current state of settings
    setActiveModules((prev) => {
      const next = prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key];
      save(next);
      return next;
    });
  }, []);

  return { activeModules, isActive, toggle };
};
