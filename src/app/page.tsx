'use client'

import styles from './page.module.css';

import { SlotData } from "@/types";

import { Client} from "archipelago.js";
import { Fragment, useCallback, useMemo, useRef, useState } from "react";

type CheckData = {
  id: number,
  name: string,
  completed: boolean,
};

enum CheckGroup {
  PURCHASE = "Purchase",
  MOVIE = "Watch Movie",
  SECRET_NOTE = "Secret Note",
  FISHING_SECRET = "Fishing Secret",
  WALNUTSANITY = "Walnutsanity",
  READ = "Read",
  RECIPE = "Recipe",
  COOK = "Cook",
  MONSTER_ERADICATION = "Monster Eradication",
  HARVEST = "Harvest",
  RARECROW = "Rarecrow",
  STARDROP = "Stardrop",
  TRASH_BEAR = "Trash Bear",
  BUNDLE = "Bundle",
  ROOM = "Room",
  TOOL = "Tool",
  CUTSCENE = "Cutscene",
  QUEST = "Quest",
  MINES_TREASURE = "Mines Treasure",
  ELEVATOR = "Elevator",
  LEVEL = "Level",
  HELP_WANTED = "Help Wanted",
  FISH = "Fish",
  MUSEUM = "Museum",
  BLUEPRINT = "Blueprint",
  TRAVELING_MERCHANT = "Traveling Merchant",
  SHIPSANITY = "Shipsanity",
  FRIENDSHIP = "Friendship",
  RACCOON = "Raccoon",
  SECRET = "Secret",
  EATSANITY = "Eatsanity",
  HAT = "Hat",
  SHARE = "Share",
  ARCADE_MACHINE = "Arcade Machine",
  OTHER = "Other",
};

const GROUPS = [
  CheckGroup.PURCHASE,
  CheckGroup.MOVIE,
  CheckGroup.FISHING_SECRET,
  CheckGroup.COOK,
  CheckGroup.HARVEST,
  CheckGroup.RARECROW,
  CheckGroup.STARDROP,
  CheckGroup.TRASH_BEAR,
  CheckGroup.BUNDLE,
  CheckGroup.ROOM,
  CheckGroup.TOOL,
  CheckGroup.CUTSCENE,
  CheckGroup.QUEST,
  CheckGroup.MINES_TREASURE,
  CheckGroup.FRIENDSHIP,
  CheckGroup.FISH,
  CheckGroup.MUSEUM,
  CheckGroup.LEVEL,
  CheckGroup.BLUEPRINT,
  CheckGroup.TRAVELING_MERCHANT,
  CheckGroup.SHIPSANITY,
  CheckGroup.RACCOON,
  CheckGroup.SECRET,
  CheckGroup.EATSANITY,
  CheckGroup.SHARE,
  CheckGroup.HAT,
  CheckGroup.ARCADE_MACHINE,
  CheckGroup.OTHER,
] as const;

class StardewChecks {
  public client: Client;
  public allChecks: Map<number, string>;
  public completedChecks: Set<number>;

  private constructor(
      client: Client,
      allChecks: Map<number, string>,
      completedChecks: Set<number>) {
    this.client = client;
    this.allChecks = allChecks;
    this.completedChecks = completedChecks;
  }

  public static create(client: Client) {
    return new StardewChecks(
      client,
      new Map(
        client.room.allLocations.map(location => [
          location,
          client.package.lookupLocationName("Stardew Valley", location)])),
      new Set(client.room.checkedLocations));
  }

  public addChecks(newChecks: Iterable<number>): StardewChecks {
    return new StardewChecks(
      this.client,
      this.allChecks,
      this.completedChecks.union(new Set(newChecks)));
  }

  public getMissingChecks(): Set<number> {
    return new Set(this.allChecks.keys()).difference(this.completedChecks);
  }

  public assignGroup(name: string): CheckGroup {
    if (name.startsWith("Secret Note #")) {
      return CheckGroup.SECRET_NOTE;
    }
    if (name.startsWith("Fishing Secret: ")) {
      return CheckGroup.FISHING_SECRET;
    }
    if (name.startsWith("Walnutsanity: ")) {
      return CheckGroup.WALNUTSANITY;
    }
    if (name.startsWith("Cook ")) {
      return CheckGroup.COOK;
    }
    if (name.startsWith("Read ")) {
      return CheckGroup.READ;
    }
    if (name.startsWith("Monster Eradication: ")) {
      return CheckGroup.MONSTER_ERADICATION;
    }
    if (name.startsWith("Harvest ")) {
      return CheckGroup.HARVEST;
    }
    if (name.startsWith("Rarecrow #")) {
      return CheckGroup.RARECROW;
    }
    if (name.startsWith("Fishsanity: ")) {
      return CheckGroup.FISH;
    }
    if (name.startsWith("Friendsanity: ")) {
      return CheckGroup.FRIENDSHIP;
    }
    if (name.startsWith("Museumsanity: ")) {
      return CheckGroup.MUSEUM;
    }
    if (name.startsWith("Help Wanted: ")) {
      return CheckGroup.HELP_WANTED;
    }
    if (name.startsWith("Secret: ")) {
      return CheckGroup.SECRET;
    }
    if (name.startsWith("JotPK: ")
        || name.startsWith("Junimo Kart: ")
        || name.startsWith("Journey of the Prairie King")) {
      return CheckGroup.ARCADE_MACHINE;
    }
    if (name.startsWith("Traveling Merchant ")) {
      return CheckGroup.TRAVELING_MERCHANT;
    }
    if (name.startsWith("Quest: ")) {
      return CheckGroup.QUEST;
    }
    if (name.startsWith("Share ")) {
      return CheckGroup.SHARE;
    }
    if (name.startsWith("Wear ")) {
      return CheckGroup.HAT;
    }
    if (name.startsWith("Eat ") || name.startsWith("Drink ")) {
      return CheckGroup.EATSANITY;
    }
    if (name.startsWith("Raccoon Request ")) {
      return CheckGroup.RACCOON;
    }
    if (name.match(/^Shipsanity: .*/)) {
      return CheckGroup.SHIPSANITY;
    }
    if (name.startsWith("Level ") || name.endsWith(" Mastery")) {
      return CheckGroup.LEVEL;
    }
    if (name.match(/.* Bundle$/)) {
      return CheckGroup.BUNDLE;
    }
    if (name.match(/^Complete .*/)) {
      return CheckGroup.ROOM;
    }
    if (name.match(/.* Pack$/) || name.match(/.* Upgrade$/) || name.match(/.* Rod$/)) {
      return CheckGroup.TOOL;
    }
    if (name.match(/.* Blueprint$/)) {
      return CheckGroup.BLUEPRINT;
    }
    if (name.match(/.* Cutscene$/) || ["Demetrius's Breakthrough"].includes(name)) {
      return CheckGroup.CUTSCENE;
    }
    if (name.match(/^The Mines Floor \d+ Treasure$/)) {
      return CheckGroup.MINES_TREASURE;
    }
    if (name.match(/.* Elevator$/)) {
      return CheckGroup.ELEVATOR;
    }
    if (name.endsWith("Stardrop")) {
      return CheckGroup.STARDROP;
    }
    if (name.endsWith(" Recipe")) {
      return CheckGroup.RECIPE;
    }
    if (name.startsWith("Watch ")) {
      return CheckGroup.MOVIE;
    }
    if (name.startsWith("Purchase ")) {
      return CheckGroup.PURCHASE;
    }
    if (name.startsWith("Trash Bear ")) {
      return CheckGroup.TRASH_BEAR;
    }
    return CheckGroup.OTHER;
  }

  public getGroupedChecks(): Map<CheckGroup, CheckData[]> {
    const groups = new Map<CheckGroup, CheckData[]>();

    for (const [checkId, checkName] of this.allChecks.entries()) {
      const assignedGroup = this.assignGroup(checkName);
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

    // console.log("dataPackage", clientRef.current.package.exportPackage());
    // console.log("allLocations", clientRef.current.room.allLocations);
    // console.log("checkedLocations", clientRef.current.room.checkedLocations);
    // console.log("missingLocations", clientRef.current.room.missingLocations);
    setStardewChecks(StardewChecks.create(clientRef.current));

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
      return GROUPS
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
