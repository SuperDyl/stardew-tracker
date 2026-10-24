'use client'

import { SlotData } from "@/types";

import { Client} from "archipelago.js";
import { useCallback, useMemo, useRef, useState } from "react";

class StardewChecks {
  public client: Client;
  public allChecks: Set<number>;
  public completedChecks: Set<number>;
  public checkNameMappings: Map<number, string>;

  private constructor(
      client: Client,
      allChecks: Set<number>,
      completedChecks: Set<number>,
      checkNameMappings: Map<number, string>) {
    this.client = client;
    this.allChecks = allChecks;
    this.completedChecks = completedChecks;
    this.checkNameMappings = checkNameMappings;
  }

  public static create(client: Client) {
    return new StardewChecks(
      client,
      new Set(client.room.allLocations),
      new Set(client.room.checkedLocations),
      new Map(
        client.room.allLocations.map(check => [
          check,
          client.package.lookupItemName("Stardew Valley", check)])));
  }

  public addChecks(newChecks: Iterable<number>): StardewChecks {
    return new StardewChecks(
      this.client,
      this.allChecks,
      this.completedChecks.union(new Set(newChecks)),
      this.checkNameMappings);
  }

  public getMissingChecks(): Set<number> {
    return this.allChecks.difference(this.completedChecks);
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

  const missingChecks = useMemo(() => stardewChecks?.getMissingChecks() ?? null, [stardewChecks]);

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
      {stardewChecks !== null &&
        <>
          {stardewChecks.completedChecks.size > 0 &&
            <>
              <h2>Completed Checks</h2>
              <ul>
                {[...stardewChecks.completedChecks].map(checkedLocation => <li key={checkedLocation}>{checkedLocation}</li>)}
              </ul>
            </>
          }
          {missingChecks !== null && missingChecks.size > 0 &&
            <>
              <h2>Missing Checks</h2>
              <ul>
                {[...missingChecks].map(missingLocation => <li key={missingLocation}>{missingLocation}</li>)}
              </ul>
            </>
          }
        </>
      }
    </>
  );
}
