-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "industry" VARCHAR(100) NOT NULL,
    "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "social_links" JSONB NOT NULL DEFAULT '{}',
    "locations" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacancies" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "modality" VARCHAR(30) NOT NULL,
    "salary" DECIMAL(10,2) NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "vacancies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
