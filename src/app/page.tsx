'use client'

import styles from './page.module.css';

import { SlotData } from "@/types";

import { Client} from "archipelago.js";
import { Fragment, useCallback, useMemo, useRef, useState } from "react";

const GAME = "Stardew Valley" as const;
const NAME_GROUP_KEY = `_read_location_name_groups_${GAME}` as const;

type CheckData = {
  id: number,
  name: string,
  completed: boolean,
};

enum CheckGroup {
  ROOM = "Community Center Room",
  BUNDLE = "Bundle",
  LEVEL = "Level",
  TOOL = "Tool",
  MINES = "Mines",
  MONSTERSANITY = "Monster Eradication",
  QUEST = "Quest",
  HELP_WANTED = "Help Wanted",
  SPECIAL_ORDER = "Special Order Board",
  FRIENDSHIP = "Friendship",
  FESTIVAL = "Festival",
  MUSEUM = "Museum",
  BLUEPRINT = "Blueprint",
  TRAVELING_MERCHANT = "Traveling Merchant",
  FISHSANITY = "Fishsanity",
  RACCOON = "Raccoon",
  TRASH_BEAR = "Trash Bear",
  CRAFT = "Craft",
  SECRET_NOTE = "Secret Note",
  SECRET = "Secret",
  ARCADE_MACHINE = "Arcade Machine",
  MOVIE = "Watch Movie",
  MOVIE_SNACK = "Eat Movie Snack",
  BOOKSANITY_LOST = "Lost Book",
  BOOKSANITY_POWER = "Power Book",
  BOOKSANITY_SKILL = "Skill Book",
  CROPSANITY = "Harvest Crop",
  SHIPSANITY_CROP = "Ship Crop",
  SHIPSANITY_FISH = "Ship Fish",
  SHIPSANITY = "Ship Other",
  CHEFSANITY = "Learn Cooking Recipe",
  COOKSANITY = "Cook",
  EATSANITY_ARTISAN = "Eatsanity Artisan",
  EATSANITY_COOKING = "Eatsanity Cooking",
  EATSANITY_CROP = "Eatsanity Crop",
  EATSANITY_FISH = "Eatsanity Fish",
  EATSANITY_POISONOUS = "Eatsanity Poisonous",
  EATSANITY_SHOP = "Eatsanity Shop",
  HATSANITY = "Hatsanity",
  SPECIAL_ORDER_QI = "Special Order Qi",
  WALNUT = "Walnut",
  WALNUT_PURCHASE = "Walnut Purchase",
  GINGER_ISLAND = "Ginger Island",
  SPOUSE = "Spouse",
  ENDGAME = "Endgame",
  OTHER = "Other",
}

class StardewChecks {
  public client: Client;
  public allChecks: Map<number, string>;
  public completedChecks: Set<number>;
  public locationGroupMapping: Map<string, CheckGroup>;

  private constructor(
      client: Client,
      allChecks: Map<number, string>,
      completedChecks: Set<number>,
      locationGroupMapping: Map<string, CheckGroup>) {
    this.client = client;
    this.allChecks = allChecks;
    this.completedChecks = completedChecks;
    this.locationGroupMapping = locationGroupMapping;
  }

  public static async create(client: Client) {
    const locationNameGroups = await client.storage.fetchLocationNameGroups(GAME) as unknown as {[NAME_GROUP_KEY]: Record<string, string[]>};
    
    const locationToGroups = new Map<string, string[]>();
    for (const [group, locations] of Object.entries(locationNameGroups[NAME_GROUP_KEY])) {
      for (const location of locations) {
        let locationGroups = locationToGroups.get(location);
        if (locationGroups === undefined) {
          locationGroups = [];
          locationToGroups.set(location, locationGroups);
        }
        locationGroups.push(group);
      }
    }

    return new StardewChecks(
      client,
      new Map(
        client.room.allLocations.map(location => [
          location,
          client.package.lookupLocationName(GAME, location)])),
      new Set(client.room.checkedLocations),
      new Map(
        [...locationToGroups.entries()].map(([location, groups]) => [location, this.assignGroup(groups)])));
  }

  public addChecks(newChecks: Iterable<number>): StardewChecks {
    return new StardewChecks(
      this.client,
      this.allChecks,
      this.completedChecks.union(new Set(newChecks)),
      this.locationGroupMapping);
  }

  public static assignGroup(groupNames: Iterable<string>): CheckGroup {
    const groupSet = new Set(groupNames);
    if (groupSet.has("Booksanity Lost")) {
      return CheckGroup.BOOKSANITY_LOST;
    }
    if (groupSet.has("Booksanity Power")) {
      return CheckGroup.BOOKSANITY_POWER;
    }
    if (groupSet.has("Booksanity Skill")) {
      return CheckGroup.BOOKSANITY_SKILL
    }
    if (groupSet.has("Chefsanity")) {
      return CheckGroup.CHEFSANITY;
    }
    if (groupSet.has("Special Order Board")) {
      return CheckGroup.SPECIAL_ORDER;
    }
    if (groupSet.has("Hatsanity")) {
      return CheckGroup.HATSANITY;
    }
    if (groupSet.has("Eatsanity Artisan")) {
      return CheckGroup.EATSANITY_ARTISAN;
    }
    if (groupSet.has("Eatsanity Cooking")) {
      return CheckGroup.EATSANITY_COOKING;
    }
    if (groupSet.has("Eatsanity Crop")) {
      return CheckGroup.EATSANITY_CROP;
    }
    if (groupSet.has("Eatsanity Fish")) {
      return CheckGroup.EATSANITY_FISH;
    }
    if (groupSet.has("Eatsanity Poisonous")) {
      return CheckGroup.EATSANITY_POISONOUS;
    }
    if (groupSet.has("Eatsanity Shop")) {
      return CheckGroup.EATSANITY_SHOP;
    }
    if (groupSet.has("Endgame Locations")) {
      return CheckGroup.ENDGAME;
    }
    if (groupSet.has("Craftsanity")) {
      return CheckGroup.CRAFT;
    }
    if (groupSet.has("Cooksanity")) {
      return CheckGroup.COOKSANITY;
    }
    if (groupSet.has("Monstersanity")) {
      return CheckGroup.MONSTERSANITY;
    }
    if (groupSet.has("Shipsanity Crop")) {
      return CheckGroup.SHIPSANITY_CROP;
    }
    if (groupSet.has("Shipsanity Fish")) {
      return CheckGroup.SHIPSANITY_FISH;
    }
    if (groupSet.has("Shipsanity")) {
      return CheckGroup.SHIPSANITY;
    }
    if (groupSet.has("Cropsanity")) {
      return CheckGroup.CROPSANITY;
    }
    if (groupSet.has("Walnutsanity")) {
      return CheckGroup.WALNUT;
    }
    if (groupSet.has("Walnut Purchase")) {
      return CheckGroup.WALNUT_PURCHASE;
    }
    if (groupSet.has("Special Order Qi")) {
      return CheckGroup.SPECIAL_ORDER_QI;
    }
    if (groupSet.has("Festival")
        || groupSet.has("Festival Hard")
        || groupSet.has("Desert Festival Chef")
        || groupSet.has("Desert Festival Chef Meal")) {
      return CheckGroup.FESTIVAL;
    }
    if (groupSet.has("Friendsanity")) {
      return CheckGroup.FRIENDSHIP;
    }
    if (groupSet.has("Museum Donations") || groupSet.has("Museum Milestones")) {
      return CheckGroup.MUSEUM;
    }
    if (groupSet.has("Fishsanity")) {
      return CheckGroup.FISHSANITY;
    }
    if (groupSet.has("Help Wanted")) {
      return CheckGroup.HELP_WANTED;
    }
    if (groupSet.has("Secret Note")) {
      return CheckGroup.SECRET_NOTE;
    }
    if (groupSet.has("Secretsanity")) {
      return CheckGroup.SECRET;
    }
    if (groupSet.has("Traveling Merchant")) {
      return CheckGroup.TRAVELING_MERCHANT;
    }
    if (groupSet.has("Story Quest")) {
      return CheckGroup.QUEST;
    }
    if (groupSet.has("Building Blueprint")) {
      return CheckGroup.BLUEPRINT;
    }
    if (groupSet.has("Trash Bear")) {
      return CheckGroup.TRASH_BEAR;
    }
    if (groupSet.has("Skill Level")) {
      return CheckGroup.LEVEL;
    }
    if (groupSet.has("The Mines Treasure") ||groupSet.has("Elevator")) {
      return CheckGroup.MINES;
    }
    if (groupSet.has("Tool Upgrade") || groupSet.has("Backpack")) {
      return CheckGroup.TOOL;
    }
    if (groupSet.has("Community Center Room")) {
      return CheckGroup.ROOM;
    }
    if (groupSet.has("Raccoon Bundles")) {
      return CheckGroup.RACCOON;
    }
    if (groupSet.has("Bundle")) {
      return CheckGroup.BUNDLE;
    }
    if (groupSet.has("Movie Snack")) {
      return CheckGroup.MOVIE_SNACK;
    }
    if (groupSet.has("Any Movie") || groupSet.has("Movie")) {
      return CheckGroup.MOVIE;
    }
    if (groupSet.has("Arcade Machine") || groupSet.has("Arcade Machine Victory")) {
      return CheckGroup.ARCADE_MACHINE;
    }
    if (groupSet.has("Ginger Island")) {
      return CheckGroup.GINGER_ISLAND;
    }
    if (groupSet.has("Baby")) {
      return CheckGroup.GINGER_ISLAND;
    }
    return CheckGroup.OTHER;
  }

  public getGroupedChecks(): Map<CheckGroup, CheckData[]> {
    const groups = new Map<CheckGroup, CheckData[]>();

    for (const [checkId, checkName] of this.allChecks.entries()) {
      let assignedGroup = this.locationGroupMapping.get(checkName);
      if (assignedGroup === undefined) {
        console.error(`Couldn't find mapping for checkId=${checkId} checkName="${checkName}"`);
        assignedGroup = CheckGroup.OTHER;
      }

      let group = groups.get(assignedGroup);
      if (group === undefined) {
        group = [];
        groups.set(assignedGroup, group);
      }
      group.push({
        id: checkId,
        name: checkName,
        completed: this.completedChecks.has(checkId),
      })
    }

    return groups;
  }
}


export default function Home() {
  const clientRef = useRef<Client | null>(null);

  const [playerName, setPlayerName] = useState("");

  const [loadedPlayer, setLoadedPlayer] = useState<string | null>(null);
  const [, setSlotData] = useState<SlotData | null>(null);

  const [loadingPlayer, setLoadingPlayer] = useState<string | null>(null);
  const [loadPlayerError, setPlayerLoadError] = useState<string | null>(null);

  const [stardewChecks, setStardewChecks] = useState<StardewChecks | null>(null);

  const connect = useCallback(async () => {
    const cleanedPlayerName = playerName.trim();
    setPlayerLoadError(null);

    if (cleanedPlayerName === loadedPlayer) {
      return;
    }

    setLoadingPlayer(cleanedPlayerName);

    if (clientRef.current !== null) {
      clientRef.current.socket.disconnect();
    }

    clientRef.current = new Client();

    try {
      const slotData = await clientRef.current.login('ws://localhost:38281', cleanedPlayerName);
      setLoadedPlayer(cleanedPlayerName)
      setSlotData(slotData as SlotData);
      // console.log('Received slot data: ', slotData);
    }
    catch (error) {
        console.error('Received error!', error);
        setPlayerLoadError('' + error);
    }
    finally {
      setLoadingPlayer(null)
    }

    // console.log("LocationNameGroups", await clientRef.current.storage.fetchLocationNameGroups(GAME))
    // console.log("dataPackage", clientRef.current.package.exportPackage());
    // console.log("allLocations", clientRef.current.room.allLocations);
    // console.log("checkedLocations", clientRef.current.room.checkedLocations);
    // console.log("missingLocations", clientRef.current.room.missingLocations);
    setStardewChecks(await StardewChecks.create(clientRef.current));

    clientRef.current.room.on(
      "locationsChecked",
      locationsChecked => {
        // console.log("locationsChecked", locationsChecked);
        setStardewChecks(stardewChecks => stardewChecks!.addChecks(locationsChecked));
      });

  }, [loadedPlayer, playerName]);

  const checkGroups = useMemo(
    () => {
      if (stardewChecks === null) {
        return null;
      }

      const checks = stardewChecks.getGroupedChecks();

      return Object.values(CheckGroup)
        .map(group => ({group: group.toString(), groupItems: checks.get(group)}))
        .filter((group): group is { group: string; groupItems: CheckData[] } =>
          group.groupItems !== undefined);
    },
    [stardewChecks]);

  return (
    <>
      <h1>Stardew Valley Archipelago Tracker</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (loadingPlayer === null) {
            connect();
          }
        }}>
        <label>Player Name: </label>
        <input
          type="text"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          disabled={loadingPlayer !== null}/>
        <button type="button" onClick={connect} disabled={loadingPlayer !== null}>Update Player</button>
      </form>
      {loadPlayerError !== null && <p>ERROR: {loadPlayerError}</p>}
      {loadedPlayer !== null && <p>Loaded player is <strong>{loadedPlayer}</strong></p>}
      {checkGroups !== null &&
        checkGroups.map(({group, groupItems}) => <Fragment key={group}>
          <h2>{group} Checks</h2>
          <ul>
            {groupItems.map(item => <li key={item.id} className={item.completed ? styles.checked : ''}>
              {item.name}
            </li>)}
          </ul>
        </Fragment>)
      }
    </>
  );
}
