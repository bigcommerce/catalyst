'use server';
import { neon } from "@neondatabase/serverless";

let dbConnect: any;

export async function connect() {
  if(!dbConnect) {
    let dbUrl: any = process.env.DATABASE_URL_BELAMI;
    const sql = neon(dbUrl);
    return sql;
  } else {
    return dbConnect;
  }
}

export const fetchCountryByZipcode = async (postalCode: string) => {
  let sql = await connect();
  const data = await sql`SELECT * FROM country_postal_code_us_ca where postal_code = ${postalCode};`;
  return data;
}

export const fetchZipCodeByLatLng = async (lat: any, lng: any) => {
  let sql = await connect();
  const data = await sql `select * from   country_postal_code_us_ca z where  earth_distance(ll_to_earth((z.latitude), (z.longitude)), ll_to_earth(${lat}, ${lng})) < ${process.env.MILES_RADIUS_IN_METERS};`;
  return data;
}