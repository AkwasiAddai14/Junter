import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent, clerkClient, UserJSON, OrganizationJSON } from '@clerk/nextjs/server'
import { maakFreelancer, updateFreelancer, verwijderFreelancer } from '@/app/lib/actions/freelancer.actions'
import { maakBedrijf, updateBedrijf, verwijderBedrijf } from '@/app/lib/actions/bedrijven.actions'
import { maakFlexpool, voegAanFlexpool, verwijderUitFlexpool, verwijderFlexpool } from '@/app/lib/actions/flexpool.actions'
import { NextResponse } from 'next/server'



export async function POST(req: Request) {

  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }
   
  // Do something with the payload
  // For this guide, you simply log the payload to the console


  interface Bedrijf extends OrganizationJSON {
    id:string | "",
    profielfoto: any | "",
    naam: string | "",
    displaynaam: string | "",
    kvknr: string | "",
    btwnr: string | "",
    postcode: string | "",
    huisnummer: string | "",
    emailadres: string | "",
    telefoonnummer: string | "",
    iban: string | "",
    path: string | ""
  }
  
  const eventType = evt.type;

  if(eventType === 'organization.created'){
    const { id, profielfoto, naam, kvknr, btwnr, postcode, huisnummer, emailadres, telefoonnummer, displaynaam, iban, path} = evt.data as Bedrijf
    const organization = {
        clerkId: id,
        profielfoto: profielfoto,
        naam: naam,
        displaynaam: displaynaam,
        kvknr: kvknr,
        btwnr: btwnr,
        postcode: postcode,
        huisnummer: huisnummer,
        emailadres: emailadres,
        telefoonnummer: telefoonnummer,
        iban: iban,
        path: path
    }
    const newOrganization = await maakBedrijf(organization);
    if(newOrganization){
        await clerkClient.organizations.updateOrganizationMetadata(id, {
            publicMetadata: {
                userId: organization.clerkId,
                naam,
                displaynaam,
                emailadres,
                telefoonnummer,
                postcode,
                huisnummer,
                btwnr,
                kvknr,
                iban,
                profielfoto,
                path
            }
        })
    }
    return NextResponse.json({message: "OK", organization: newOrganization})
  }


  if(eventType === 'organization.updated'){
    const { id, profielfoto, naam, kvknr, btwnr, postcode, huisnummer, emailadres, telefoonnummer, displaynaam, iban, path} = evt.data as Bedrijf
    const organization = {
        clerkId: id,
        profielfoto: profielfoto,
        naam: naam,
        kvknr: kvknr,
        btwnr: btwnr,
        displaynaam: displaynaam,
        postcode: postcode,
        huisnummer: huisnummer,
        emailadres: emailadres,
        telefoonnummer: telefoonnummer,
        iban: iban,
        path: path
    }
    const newOrganization = await updateBedrijf(organization);
    if(newOrganization){
        await clerkClient.organizations.updateOrganizationMetadata(id, {
            publicMetadata: {
                userId: organization.clerkId,
                naam,
                displaynaam,
                emailadres,
                telefoonnummer,
                postcode,
                huisnummer,
                btwnr,
                kvknr,
                iban,
                profielfoto,
                path
            }
        })
    }
    return NextResponse.json({message: "OK", organization: newOrganization})
  }


  if(eventType === 'organization.deleted'){
    const { id, profielfoto, naam, kvknr, btwnr, postcode, huisnummer, emailadres, displaynaam, telefoonnummer, iban, path} = evt.data as unknown as Bedrijf
    const organization = {
        clerkId: id,
        profielfoto: profielfoto,
        displaynaam: displaynaam,
        naam: naam,
        kvknr: kvknr,
        btwnr: btwnr,
        postcode: postcode,
        huisnummer: huisnummer,
        emailadres: emailadres,
        telefoonnummer: telefoonnummer,
        iban: iban,
        path: path
    }
    const newOrganization = await verwijderBedrijf(organization);
    if(newOrganization){
        await clerkClient.organizations.updateOrganizationMetadata(id, {
            publicMetadata: {
                userId: organization.clerkId,
                naam,
                emailadres,
                displaynaam,
                telefoonnummer,
                postcode,
                huisnummer,
                btwnr,
                kvknr,
                iban,
                profielfoto,
                path
            }
        })
    }
    return NextResponse.json({message: "OK", organization: newOrganization})
  }
  
  interface Werkervaring {
    bedrijf: string;
    functie: string;
    duur: string;
  }
  
  interface Vaardigheid {
    vaardigheid: string;
  }
  
  interface Opleiding {
    naam: string;
    school: string;
    niveau?: string;
  }
  
  interface Freelancer extends UserJSON {
    id: string;
    profielfoto: string;
    voornaam: string;
    achternaam: string;
    tussenvoegsel?: string;
    geboortedatum: string;
    kvknr?: string;
    btwid?: string;
    postcode: string;
    huisnummer: string;
    stad: string;
    straat: string;
    emailadres: string;
    telefoonnummer: string;
    iban: string;
    onboarded: true;
    korregeling: boolean;
    werkervaring: Werkervaring[];
    vaardigheden: Vaardigheid[];
    opleidingen: Opleiding[];
    cv: any;
    bio: string;
    kvk?: string;
    bsn: string;
    path: string;
  }

  if (eventType === 'user.created') {
    const { id, voornaam, tussenvoegsel, achternaam, geboortedatum, emailadres, telefoonnummer, postcode, huisnummer, stad, straat, onboarded, btwid, iban, bsn, profielfoto, korregeling, werkervaring, cv, vaardigheden, opleidingen, bio, kvk, path } = evt.data as Freelancer;

    const user = {
      clerkId: id,
      voornaam,
      tussenvoegsel,
      achternaam,
      geboortedatum,
      emailadres,
      telefoonnummer,
      postcode,
      huisnummer,
      btwid,
      iban,
      onboarded,
      profielfoto,
      korregeling,
      werkervaring,
      vaardigheden,
      opleidingen,
      cv,
      path,
      straat,
      stad,
      bio,
      bsn,
      kvk,
    };

    try {
      const newUser = await maakFreelancer(user);
      if (newUser) {
        await clerkClient.users.updateUserMetadata(id, {
          publicMetadata: {
            userId: user.clerkId,
            voornaam,
            tussenvoegsel,
            achternaam,
            geboortedatum,
            emailadres,
            telefoonnummer,
            postcode,
            huisnummer,
            straat: user.straat,
            stad: user.stad,
            btwid,
            iban,
            onboarded,
            profielfoto,
            korregeling,
            werkervaring,
            vaardigheden,
            opleidingen,
            cv,
            bsn,
            path,
          },
        });
      }
      return NextResponse.json({ message: 'OK', user: newUser });
    } catch (error) {
      return NextResponse.json({ message: 'Error creating user', error }, { status: 500 });
    }
  }


  if(eventType === 'user.updated'){
    const { id, voornaam, tussenvoegsel, achternaam, geboortedatum, emailadres, telefoonnummer, postcode, huisnummer, stad, straat, btwid, bsn, onboarded, iban, profielfoto, korregeling, werkervaring, cv, vaardigheden, opleidingen, kvk, bio, path} = evt.data as Freelancer
    const user = {
        clerkId: id,
        voornaam: voornaam,
        tussenvoegsel: tussenvoegsel,
        achternaam: achternaam,
        geboortedatum: geboortedatum,
        emailadres: emailadres,
        telefoonnummer: telefoonnummer,
        postcode: postcode,
        huisnummer: huisnummer,
        stad: stad,
        straat: straat,
        btwid: btwid,
        iban: iban,
        onboarded: onboarded,
        profielfoto: profielfoto,
        korregeling: korregeling,
        werkervaring: werkervaring,
        vaardigheden: vaardigheden,
        opleidingen: opleidingen,
        kvk: kvk,
        bio: bio,
        cv: cv,
        bsn: bsn,
        path: path
    }
    const newUser = await updateFreelancer(user);
    if(newUser){
        await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: {
                userId: user.clerkId,
                voornaam,
                tussenvoegsel,
                achternaam,
                geboortedatum,
                emailadres,
                telefoonnummer,
                postcode,
                huisnummer,
                stad,
                straat,
                btwid,
                iban,
                onboarded,
                profielfoto,
                korregeling,
                werkervaring,
                vaardigheden,
                opleidingen,
                kvk,
                bio,
                cv,
                path
            }
        })
    }
    return NextResponse.json({message: "OK", user: newUser})
  }


  if(eventType === 'user.deleted'){
    const { id, voornaam, tussenvoegsel, achternaam, geboortedatum, emailadres, telefoonnummer, postcode, huisnummer, btwid, iban, profielfoto, onboarded, korregeling, werkervaring, vaardigheden, opleidingen, path} = evt.data as unknown as Freelancer
    const user = {
        clerkId: id,
        voornaam: voornaam,
        tussenvoegsel: tussenvoegsel,
        achternaam: achternaam,
        geboortedatum: geboortedatum,
        emailadres: emailadres,
        telefoonnummer: telefoonnummer,
        postcode: postcode,
        huisnummer: huisnummer,
        btwid: btwid,
        iban: iban,
        onboarded: onboarded,
        profielfoto: profielfoto,
        korregeling: korregeling,
        werkervaring: werkervaring,
        vaardigheden: vaardigheden,
        opleidingen: opleidingen,
        path: path
    }
    const newUser = await verwijderFreelancer(user.clerkId);
    if(newUser){
        await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: {
                userId: user.clerkId,
                voornaam,
                tussenvoegsel,
                achternaam,
                geboortedatum,
                emailadres,
                telefoonnummer,
                postcode,
                huisnummer,
                btwid,
                iban,
                profielfoto,
                korregeling,
                onboarded,
                werkervaring,
                vaardigheden,
                opleidingen,
                path
            }
        })
    }
    return NextResponse.json({message: "OK", user: newUser})
  }
  
  return new Response('', { status: 200 })
}