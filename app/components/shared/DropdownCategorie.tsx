import React, { startTransition, useEffect, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectLabel,
    SelectGroup,
  } from "@/app/components/ui/select"
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/app/components/ui/alert-dialog"
  import type { ICategory } from '@/app/lib/models/categorie.model'
import { Input } from '@headlessui/react'
import { getAllCategories, voegAangepast } from '@/app/lib/actions/shift.actions'


  type DropdownProps = {
    value?: string,
    onChangeHandler? : () => void
  }


const DropdownCategorie = ({value, onChangeHandler}: DropdownProps) => {
     const [categorie, setCategorie] = useState<ICategory[]>([])
     const [aangepast, setAangepast] = useState('');

     const voegCategorieToe = () => {
        voegAangepast({
          Aangepast: aangepast.trim()
        })
          .then((categorie) => {
            setCategorie((prevState) => [...prevState, categorie])
          })
      }

useEffect(() =>{
    const getCategories = async () => {
    const categoryList = await getAllCategories();

    categoryList && setCategorie(categoryList as ICategory[])
    }
})

  return (
    <div>
        <Select onValueChange={onChangeHandler} defaultValue={value}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Categorie" />
    </SelectTrigger>
    <SelectContent>


    <SelectGroup>
      <SelectLabel>Horeca</SelectLabel>
      <SelectItem value="Horeca: restaurants">restaurant</SelectItem>
      <SelectItem value="Horeca: cafes en bars">cafe en bar</SelectItem>
      <SelectItem value="Horeca: catering">catering</SelectItem>
      <SelectItem value="Horeca: hotels">hotel</SelectItem>
      </SelectGroup>

      <SelectGroup>
      <SelectLabel>Retail</SelectLabel>  
      <SelectItem value="Retail: supermarkten">supermarkt</SelectItem>
      <SelectItem value="Retail: kledingwinkels">kledingwinkel</SelectItem>
      <SelectItem value="Retail: elektronicazaken">elektronicazaak</SelectItem>
      <SelectItem value="Retail: Warenhuizen">warenhuis</SelectItem>
      </SelectGroup>

      <SelectGroup>
      <SelectLabel>Logistiek en Magazijnwerk</SelectLabel>  
      <SelectItem value="Logistiek: distributiecentra">distributiecentrum</SelectItem>
      <SelectItem value="Logistiek: bezorging">bezorging</SelectItem>
      <SelectItem value="Logistiek: magazijnen">magazijn</SelectItem>
      </SelectGroup>

      <SelectGroup>
      <SelectLabel>Klantenservice en Callcenters</SelectLabel>  
      <SelectItem value="Klantenservice: telefonische ondersteuning">telefonische ondersteuning</SelectItem>
      <SelectItem value="Klantenservice: klantendienst">klantendienst</SelectItem>
      <SelectItem value="Klantenservice: Chat support">chat support</SelectItem>
      </SelectGroup>

      <SelectGroup>
      <SelectLabel>Onderwijs en Bijles</SelectLabel>
      <SelectItem value="Onderwijs: tutorwerk">tutorwerk</SelectItem>
      <SelectItem value="onderwijs: onderwijsassistent">onderwijsassistent</SelectItem>
      <SelectItem value="Onderwijs: huiswerkbegeleiding">huiswerkbegeleiding</SelectItem>
      </SelectGroup>


      <SelectGroup>
      <SelectLabel>Zorg en Welzijn</SelectLabel>
      <SelectItem value="Zorg: Thuiszorg">thuiszorg</SelectItem>
      <SelectItem value="Zorg: zorgassistenten zorgassistenten">onderwijsassistent</SelectItem>
      <SelectItem value="Zorg: kinderopvang">kinderopvang</SelectItem>
      </SelectGroup>

      <SelectGroup>
      <SelectLabel>Marketing en Promotie</SelectLabel>
      <SelectItem value="Marketing: promotiewerk">promotiewerk</SelectItem>
      <SelectItem value="Marketing: marktonderzoek">marktonderzoek</SelectItem>
      <SelectItem value="Marketing: social media beheer">social media beheer </SelectItem>
      </SelectGroup>

      <SelectGroup>
      <SelectLabel>Evenementen en Entertainment</SelectLabel>
      <SelectItem value="Entertainment: festivalmedewerker">festivalmedewerker</SelectItem>
      <SelectItem value="Entertainment: beveiliging">beveiliging</SelectItem>
      <SelectItem value="Entertainment: bedrijf">bedrijf</SelectItem>
      </SelectGroup>

      <SelectGroup>
      <SelectLabel>Creatief werk</SelectLabel>
      <SelectItem value="Creatief: grafisch ontwerp">grafisch ontwerp</SelectItem>
      <SelectItem value="Creatief: schrijven en redigeren">schrijven</SelectItem>
      <SelectItem value="Creatief: fotografie">fotografie</SelectItem>
      </SelectGroup>


      <SelectGroup>
      <SelectLabel>Technologie en IT</SelectLabel>
      <SelectItem value="IT: helpdeskondersteuning">helpdeskondersteuning</SelectItem>
      <SelectItem value="IT: webontwikkeling">webontwikkeling</SelectItem>
      <SelectItem value="IT: app-ontwikkeling">app-ontwikkeling</SelectItem>
      </SelectGroup>

      <SelectGroup>
      <SelectLabel>Productie en Fabrieken</SelectLabel>
      <SelectItem value="Productie: assemblagelijnen">assemblagelijnen</SelectItem>
      <SelectItem value="Productie: voedselverwerking">voedselverwerking</SelectItem>
      <SelectItem value="Productie: productie-assisententen">productie-assistenten</SelectItem>
      </SelectGroup>


      <SelectGroup>
      <SelectLabel>Landbow en Seizoenswerk</SelectLabel>
      <SelectItem value="Landbouw: oggstwerk">oogstwerk</SelectItem>
      <SelectItem value="Landbouw: plukken van fruit">plukken van fruit</SelectItem>
      <SelectItem value="Landbouw: werken op boerderijen">werken op boerderijen</SelectItem>
      </SelectGroup>

      <SelectGroup>
      <SelectLabel>Administatie en Kantoorwerk</SelectLabel>
      <SelectItem value="Admninistratie: data-invoer">data-invoer</SelectItem>
      <SelectItem value="Administratie: administratieve assistentie">administratieve assistentie</SelectItem>
      <SelectItem value="Administratie: receptiewerk">receptiewerk</SelectItem>
      </SelectGroup>

      <SelectGroup>
      <SelectLabel>Toerime en Reizen</SelectLabel>
      <SelectItem value="Toerimse: reisleiders">reisleiders</SelectItem>
      <SelectItem value="Toerimse: Frontdesk hotels">Frontdesk hotels</SelectItem>
      <SelectItem value="Toerisme: reisbureau">reisbureau</SelectItem>
      </SelectGroup>

      <SelectGroup>
      <SelectLabel>Sport en Fitness</SelectLabel>
      <SelectItem value="Sport: fitnessinstructeurs">fitnessinstructeurs</SelectItem>
      <SelectItem value="Sport: zweminstructeurs">zweminstructeurs</SelectItem>
      <SelectItem value="Sport: sportcoaching">sportcoaching</SelectItem>
      </SelectGroup>

     
   
      <SelectGroup>
        <SelectLabel>Schoonmaak</SelectLabel>
      <SelectItem value="Schoonmaak: kantoren">kantoren</SelectItem>
      <SelectItem value="Schoonmaak: scholen en onderwijsinstellingen">onderwijsinstellingen</SelectItem>
      <SelectItem value="Schoonmaak: horeca">horeca</SelectItem>
      <SelectItem value="Schoonmaak: gezondheidszorg">gezondheidszorg</SelectItem>
      <SelectItem value="Schoonmaak: evenementenlocatie">evenementenlocatie</SelectItem>
      <SelectItem value="Schoonmaak: detailhandel">detailhandel</SelectItem>
      <SelectItem value="Schoonmaak: openbare ruimtes">openbare ruimtes</SelectItem>
      <SelectItem value="Schoonmaak: privewoningen">privewoningen</SelectItem>
      <SelectItem value="Schoonmaak: vakantiehuizen">vakantiehuizen</SelectItem>
      </SelectGroup>
      


      {categorie.length > 0 && categorie.map((categorie) => (
          <SelectItem key={categorie._id} value={categorie._id} className="select-item p-regular-14">
            {categorie.name}
          </SelectItem>
        ))}


      <AlertDialog>
          <AlertDialogTrigger className="p-medium-14 flex w-full rounded-sm py-3 pl-8 text-primary-500 hover:bg-primary-50 focus:text-primary-500">Categorie</AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Categorie</AlertDialogTitle>
              <AlertDialogDescription>
                <Input type="text" placeholder="voeg categorie toe" className="input-field mt-3" onChange={(e) => setAangepast(e.target.value)} />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuleer</AlertDialogCancel>
              <AlertDialogAction onClick={() => startTransition(voegCategorieToe)}>Toevoegen</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

    </SelectContent>
  </Select>
  </div>
  )
}

export default DropdownCategorie