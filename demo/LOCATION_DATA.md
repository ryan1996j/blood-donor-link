# Location data

The local `src/locations.json` snapshot contains 330 townships and 18 source region/sub-region records. The UI groups Bago East/West and Shan South/North/East into 15 state, region and union territory choices. Original source records and township codes remain in the JSON snapshot.

Source: https://services.arcgis.com/pGfbNJoYypmNq86F/ArcGIS/rest/services/Myanmar_EQ_RNA_data/FeatureServer/0

Retrieved: 31 October 2026. The layer description identifies its place codes as **MIMU v9.4**. It is a published derivative, not the latest v9.7 release. Direct retrieval from the MIMU download page returned HTTP 403 during implementation. Verify against a current MIMU release and confirm redistribution terms before public deployment.

Attribution from the source: Place Names from General Administration Department (GAD). Transliteration by MIMU. Coordinates and boundaries by MIMU. Only names and place codes were imported; geometry and unrelated fields were excluded.

The source provides information as is, for reference only, without warranties of accuracy or completeness or implied United Nations endorsement. Canonical reference: https://themimu.info/place-codes

Location dropdowns use the bundled snapshot; opening them makes no external API request. Donors store township Pcodes and the grouped parent region. Existing six-township demo records migrate automatically, including the legacy Kamayut spelling to the source's Kamaryut. No donor details are uploaded during migration.
