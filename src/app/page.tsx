'use client'

import { StardewChecks } from '@/stardew-checks';
import styles from './page.module.css';

import { SlotData } from "@/types";

import { Client} from "archipelago.js";
import { Fragment, useCallback, useMemo, useRef, useState } from "react";


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
    () => stardewChecks?.getOrderedGroupedChecks() ?? null,
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
