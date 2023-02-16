#!/usr/bin/env python3
import csv
import sys 
from itertools import chain

# From the old Solana token registry
KNOWN_DUPLICATES = {
    'AVAX': ['KgV1GvrHQmRBY8sHQQeUKwTm2r2h8t4C8qt12Cw1HVE', 'AUrMpCDYYcPuHhyNX8gEEqbmDPFUpBpHrNW3vPeCFn5Z'],
    'GEAR': ['7s6NLX42eURZfpyuKkVLrr9ED9hJE8718cyXFsYKqq5g', '23WuycvPjEuzJTsBPBZqnbFZFcBtBKAMTowUDHwagkuD'],
    'sRLY': ['sRLY3migNrkC1HLgqotpvi66qGkdNedqPZ9TJpAQhyh', 'RLYv2ubRMDLcGG2UyvPmnPmkfuQTsMbg4Jtygc7dmnq'],
    'MILK': ['MLKmUCaj1dpBY881aFsrBwR9RUMoKic8SWT3u1q5Nkj', 'CCKDRAd4Xwjoovtf2s1duu3d4TPTmFRyh1hfrb3ZUGR2'],
}

# Flatten lists to set.
KNOWN_DUPLICATE_MINTS = set(sum(KNOWN_DUPLICATES.values(), []))

with open('validated-tokens.csv', newline='') as csvfile:
    reader = csv.reader(csvfile, delimiter=',')

    symbolToMint = {}
    for row in reader:
        symbol = row[1]
        mint = row[2]
        hasDuplicate = symbolToMint.get(symbol, None)
        if hasDuplicate != None and mint not in KNOWN_DUPLICATE_MINTS:
            print('New duplicate', mint)
             # Raise system exit so cron-job flags it as failed.
            sys.exit(1)
        else:
            symbolToMint[row[1]] = [row[2]]