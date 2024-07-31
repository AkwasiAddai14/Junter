export default function Contactkanalen() {
    return (
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl space-y-16 divide-y divide-gray-100 lg:mx-0 lg:max-w-none">
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Get in touch</h2>
                <p className="mt-4 leading-7 text-gray-600">
                  Gewoonlijk binnen 24 uur reactie
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2 lg:gap-8">
                <div className="rounded-2xl bg-gray-50 p-10">
                  <h3 className="text-base font-semibold leading-7 text-gray-900">WhatsApp Support</h3>
                  <dl className="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                    <div>
                      <dt className="sr-only">WhatsApp support</dt>
                      <dd>
                        <a className="font-semibold text-sky-600" href="https://wa.me/message/O7L3TX3O4MNGF1">
                          WhatsApp Support
                        </a>
                      </dd>
                    </div>
                    <div className="mt-1">
                      <dt className="sr-only">WhatsApp Support</dt>
                      <dd>Support</dd>
                    </div>
                  </dl>
                </div>


                <div className="rounded-2xl bg-gray-50 p-10">
                  <h3 className="text-base font-semibold leading-7 text-gray-900">WhatsApp community</h3>
                  <dl className="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                    <div>
                      <dt className="sr-only">WhatsApp community</dt>
                      <dd>
                        <a className="font-semibold text-sky-600" href="https://chat.whatsapp.com/LTmywVtJToOGmjS7zRf8Ay">
                          WhatsApp community
                        </a>
                      </dd>
                    </div>
                    <div className="mt-1">
                      <dt className="sr-only">Voor freelancers</dt>
                      <dd>Voor het uiwisselen van shifts</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl bg-gray-50 p-10">
                  <h3 className="text-base font-semibold leading-7 text-gray-900">Email naar</h3>
                  <dl className="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                    <div>
                      <dt className="sr-only">Email support</dt>
                      <dd>
                        <a className="font-semibold text-sky-600" href="mailto:support@junter.works">
                          support@junter.works
                        </a>
                      </dd>
                    </div>
                    <div className="mt-1">
                      <dt className="sr-only">Email</dt>
                      <dd>Voor algemene zaken</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl bg-gray-50 p-10">
                  <h3 className="text-base font-semibold leading-7 text-gray-900">Email naar </h3>
                  <dl className="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                    <div>
                      <dt className="sr-only">Email</dt>
                      <dd>
                        <a className="font-semibold text-sky-600" href="mailto:billing@junter.works">
                          billing@junter.works
                        </a>
                      </dd>
                    </div>
                    <div className="mt-1">
                      <dt className="sr-only">Email for billing</dt>
                      <dd>Voor betalingen en facturen</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  